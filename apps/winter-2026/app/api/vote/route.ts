import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@ai-olympics/shared/db";
import {
  getEvent,
  getAllModels,
  insertVote,
  getVoteCounts,
  getMedalsForEvent,
  getResponsesForEvent,
} from "@ai-olympics/shared/db/queries";
import {
  computeFingerprint,
  resolveBlindIndex,
  getBlindMapping,
  BLIND_LABELS,
} from "@ai-olympics/shared";
import { MODEL_IDS } from "@/lib/event-config";
import type { RevealedModel } from "@ai-olympics/shared";

export async function POST(req: NextRequest) {
  const { event_id, model_index, scores } = await req.json();

  if (!event_id || model_index === undefined) {
    return NextResponse.json({ error: "Missing event_id or model_index" }, { status: 400 });
  }

  const db = getDb();
  const event = await getEvent(db, event_id);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (event.status !== "voting") {
    return NextResponse.json({ error: "Voting is not open" }, { status: 400 });
  }

  // Compute voter fingerprint
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const ua = req.headers.get("user-agent") ?? "unknown";
  const fingerprint = await computeFingerprint(ip, ua);

  // Resolve blind index → real model ID
  const modelIds = MODEL_IDS as unknown as string[];
  const realModelId = resolveBlindIndex(event_id, modelIds, model_index);

  // Insert vote (unique constraint prevents double-voting)
  try {
    await insertVote(db, {
      event_id,
      model_id: realModelId,
      voter_fingerprint: fingerprint,
      scores: scores ?? null,
    });
  } catch (err: unknown) {
    // PostgreSQL unique violation = error code 23505
    const pgError = err as { code?: string };
    if (pgError.code === "23505") {
      return NextResponse.json({ error: "Already voted" }, { status: 409 });
    }
    throw err;
  }

  // Build reveal data
  const allModels = await getAllModels(db);
  const modelsMap = Object.fromEntries(allModels.map((m) => [m.id, m]));
  const responses = await getResponsesForEvent(db, event_id);
  const responsesMap = Object.fromEntries(responses.map((r) => [r.model_id, r]));
  const voteCounts = await getVoteCounts(db, event_id);
  const voteMap = Object.fromEntries(voteCounts.map((v) => [v.model_id, v.count]));
  const eventMedals = await getMedalsForEvent(db, event_id);
  const medalMap = Object.fromEntries(eventMedals.map((m) => [m.model_id, m.medal]));
  const blindMapping = getBlindMapping(event_id, modelIds);

  const reveal: RevealedModel[] = blindMapping.map(({ blindIndex, modelId }) => {
    const model = modelsMap[modelId];
    const response = responsesMap[modelId];
    return {
      index: blindIndex,
      label: BLIND_LABELS[blindIndex],
      model_id: modelId,
      name: model?.name ?? modelId,
      country: model?.country ?? "",
      country_code: model?.country_code ?? "",
      flag_emoji: model?.flag_emoji ?? "",
      color: model?.color ?? "#888",
      content: response?.content ?? "",
      votes: voteMap[modelId] ?? 0,
      medal: (medalMap[modelId] as "gold" | "silver" | "bronze") ?? null,
    };
  });

  return NextResponse.json({ success: true, reveal });
}
