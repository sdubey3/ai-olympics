import { NextRequest } from "next/server";
import { streamText } from "ai";
import { getDb } from "@ai-olympics/shared/db";
import { getEvent, getAllModels, insertResponse, updateEventStatus } from "@ai-olympics/shared/db/queries";
import { createOpenRouterProvider } from "@ai-olympics/shared/ai";
import { getBlindMapping, autoScoreSyllables, autoScoreCode, autoScoreGates } from "@ai-olympics/shared";
import { OPENROUTER_MODELS, MODEL_IDS } from "@/lib/event-config";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const { event_id } = await req.json();
  if (!event_id) {
    return new Response("Missing event_id", { status: 400 });
  }

  const db = getDb();
  const event = await getEvent(db, event_id);
  if (!event) {
    return new Response("Event not found", { status: 404 });
  }

  const allModels = await getAllModels(db);
  const modelIds = MODEL_IDS as unknown as string[];
  const blindMapping = getBlindMapping(event_id, modelIds);

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response("OPENROUTER_API_KEY not set", { status: 500 });
  }

  const provider = createOpenRouterProvider(apiKey);
  const prompts = event.prompts as { round: number; system?: string; user: string; max_tokens: number }[];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Process each round of prompts
        for (const prompt of prompts) {
          const modelPromises = blindMapping.map(async ({ blindIndex, modelId }) => {
            const openRouterId = OPENROUTER_MODELS[modelId];
            if (!openRouterId) return;

            const startTime = Date.now();
            let fullContent = "";

            try {
              const result = streamText({
                model: provider(openRouterId),
                system: prompt.system,
                prompt: prompt.user,
                maxTokens: prompt.max_tokens,
              });

              for await (const chunk of result.textStream) {
                fullContent += chunk;
                const sseData: string = JSON.stringify({
                  modelIndex: blindIndex,
                  delta: chunk,
                  done: false,
                  round: prompt.round,
                });
                controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
              }

              const generationMs = Date.now() - startTime;

              // Auto-score based on event type
              let autoScore: Record<string, number> | null = null;
              if (event.scoring_type === "hybrid" || event.scoring_type === "auto_vote") {
                if (event_id === "big-air" || (event_id === "biathlon" && prompt.round === 2)) {
                  const syllableResult = autoScoreSyllables(fullContent);
                  autoScore = {
                    valid: syllableResult.valid ? 1 : 0,
                    lines: syllableResult.lines,
                    ...Object.fromEntries(
                      syllableResult.syllables.map((s, i) => [`syllable_${i + 1}`, s])
                    ),
                  };
                } else if (event_id === "biathlon" && prompt.round === 1) {
                  const codeResult = autoScoreCode(fullContent);
                  autoScore = {
                    has_function: codeResult.has_function ? 1 : 0,
                    has_logic: codeResult.has_logic ? 1 : 0,
                    has_output: codeResult.has_output ? 1 : 0,
                    score: codeResult.score,
                  };
                } else if (event_id === "slalom") {
                  const gateResult = autoScoreGates(fullContent);
                  autoScore = {
                    passed: gateResult.passed,
                    total: gateResult.total,
                    ...Object.fromEntries(
                      Object.entries(gateResult.gates).map(([k, v]) => [k, v ? 1 : 0])
                    ),
                  };
                }
              }

              // Store response in DB
              await insertResponse(db, {
                event_id,
                model_id: modelId,
                round: prompt.round,
                content: fullContent,
                generation_ms: generationMs,
                auto_score: autoScore,
              });

              // Send done signal for this model+round
              const doneData = JSON.stringify({
                modelIndex: blindIndex,
                delta: "",
                done: true,
                round: prompt.round,
              });
              controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
            } catch (err) {
              console.error(`Error generating for ${modelId}:`, err);
              // Send error signal
              const errData = JSON.stringify({
                modelIndex: blindIndex,
                delta: "[Generation error]",
                done: true,
                round: prompt.round,
              });
              controller.enqueue(encoder.encode(`data: ${errData}\n\n`));

              // Still store what we have
              if (fullContent) {
                await insertResponse(db, {
                  event_id,
                  model_id: modelId,
                  round: prompt.round,
                  content: fullContent,
                  generation_ms: Date.now() - startTime,
                  auto_score: null,
                });
              }
            }
          });

          // Run all models in parallel for this round
          await Promise.all(modelPromises);
        }

        // All done
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        console.error("Stream error:", err);
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
