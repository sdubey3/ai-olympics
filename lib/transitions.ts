import type { Database } from "./db";
import {
  getAllEvents,
  updateEventStatus,
  getResponseCount,
  getVoteCounts,
  insertMedal,
} from "./db/queries";
import { computeMedals } from "./scoring";
import { NUM_MODELS } from "./constants";

/**
 * Check all events and apply any pending state transitions.
 * Called from polling endpoints and the daily cron fallback.
 */
export async function checkAndTransitionEvents(
  db: Database
): Promise<string[]> {
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

    // 2. generating → voting: when all model responses exist
    if (event.status === "generating") {
      const responseCount = await getResponseCount(db, event.id);
      const promptCount = (event.prompts as unknown[]).length;
      const expectedResponses = NUM_MODELS * promptCount;

      if (responseCount >= expectedResponses) {
        await updateEventStatus(db, event.id, "voting");
        transitions.push(`${event.id}: generating → voting`);
      }
    }

    // 3. voting → closed: when voting_closes_at has passed
    if (event.status === "voting" && now >= votingClosesAt) {
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

  return transitions;
}
