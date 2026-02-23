import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@ai-olympics/shared/db";
import {
  getAllEvents,
  updateEventStatus,
  getResponseCount,
  getVoteCounts,
  insertMedal,
} from "@ai-olympics/shared/db/queries";
import { computeMedals, NUM_MODELS } from "@ai-olympics/shared";

export async function POST(req: NextRequest) {
  // Authenticate cron
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const events = await getAllEvents(db);
  const now = new Date();
  const transitions: string[] = [];

  for (const event of events) {
    const scheduledAt = new Date(event.scheduled_at);
    const votingClosesAt = new Date(event.voting_closes_at);

    // 1. upcoming → generating: when scheduled_at has passed
    if (event.status === "upcoming" && now >= scheduledAt) {
      await updateEventStatus(db, event.id, "generating");
      transitions.push(`${event.id}: upcoming → generating`);

      // Fire off generation (non-blocking)
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

      fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: event.id }),
      }).catch((err) => console.error("Generate trigger failed:", err));
    }

    // 2. generating → voting: when all 5 model responses exist
    if (event.status === "generating") {
      const responseCount = await getResponseCount(db, event.id);
      // For multi-round events (biathlon), need responses per round
      const promptCount = (event.prompts as unknown[]).length;
      const expectedResponses = NUM_MODELS * promptCount;

      if (responseCount >= expectedResponses) {
        await updateEventStatus(db, event.id, "voting");
        transitions.push(`${event.id}: generating → voting`);
      }
    }

    // 3. voting → closed: when voting_closes_at has passed
    if (event.status === "voting" && now >= votingClosesAt) {
      // Compute final scores and award medals
      const voteCounts = await getVoteCounts(db, event.id);
      const modelScores = voteCounts.map((v) => ({
        modelId: v.model_id,
        score: v.count,
      }));

      if (modelScores.length > 0) {
        const medalResults = computeMedals(modelScores);
        for (const m of medalResults) {
          await insertMedal(db, {
            event_id: event.id,
            model_id: m.modelId,
            medal: m.medal,
            final_score: m.score,
          });
        }
      }

      await updateEventStatus(db, event.id, "closed");
      transitions.push(`${event.id}: voting → closed`);
    }
  }

  return NextResponse.json({
    ok: true,
    transitions,
    timestamp: now.toISOString(),
  });
}
