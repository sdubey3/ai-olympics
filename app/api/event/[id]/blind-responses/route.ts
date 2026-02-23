import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getEvent, getResponsesForEvent } from "@/lib/db/queries";
import { getBlindMapping } from "@/lib/shuffle";
import { BLIND_LABELS } from "@/lib/constants";
import { MODEL_IDS } from "@/lib/event-config";
import type { BlindModel } from "@/lib/types";

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

  const responses = await getResponsesForEvent(db, eventId);
  const responsesMap = Object.fromEntries(
    responses.map((r) => [r.model_id, r])
  );

  const modelIds = MODEL_IDS as unknown as string[];
  const blindMapping = getBlindMapping(eventId, modelIds);

  // Return responses in blind order -- NO model_id exposed
  const blindResponses: BlindModel[] = blindMapping.map(
    ({ blindIndex, modelId }) => ({
      index: blindIndex,
      label: BLIND_LABELS[blindIndex],
      content: responsesMap[modelId]?.content ?? "",
    })
  );

  return NextResponse.json({
    event_id: eventId,
    status: event.status,
    responses: blindResponses,
  });
}
