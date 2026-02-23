import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@ai-olympics/shared/db";
import {
  getEvent,
  getAllModels,
  getVoteCounts,
  getMedalsForEvent,
  getResponsesForEvent,
} from "@ai-olympics/shared/db/queries";
import { getBlindMapping, BLIND_LABELS } from "@ai-olympics/shared";
import { MODEL_IDS } from "@/lib/event-config";
import type { RevealedModel, ResultsResponse } from "@ai-olympics/shared";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const db = getDb();
  const event = await getEvent(db, eventId);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const allModels = await getAllModels(db);
  const modelsMap = Object.fromEntries(allModels.map((m) => [m.id, m]));
  const responses = await getResponsesForEvent(db, eventId);
  const responsesMap = Object.fromEntries(responses.map((r) => [r.model_id, r]));
  const voteCounts = await getVoteCounts(db, eventId);
  const voteMap = Object.fromEntries(voteCounts.map((v) => [v.model_id, v.count]));
  const eventMedals = await getMedalsForEvent(db, eventId);
  const medalMap = Object.fromEntries(eventMedals.map((m) => [m.model_id, m.medal]));

  const modelIds = MODEL_IDS as unknown as string[];
  const blindMapping = getBlindMapping(eventId, modelIds);

  const totalVotes = voteCounts.reduce((sum, v) => sum + v.count, 0);

  const models: RevealedModel[] = blindMapping.map(({ blindIndex, modelId }) => {
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

  const result: ResultsResponse = {
    event_id: eventId,
    status: event.status as ResultsResponse["status"],
    models,
    total_votes: totalVotes,
  };

  return NextResponse.json(result);
}
