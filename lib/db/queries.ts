import { eq, sql, count, and } from "drizzle-orm";
import type { Database } from "./index";
import { events, models, responses, votes, medals } from "./schema";
import type { LeaderboardRow } from "../types";

export async function getEvent(db: Database, eventId: string) {
  const result = await db.select().from(events).where(eq(events.id, eventId));
  return result[0] ?? null;
}

export async function getAllEvents(db: Database) {
  return db.select().from(events).orderBy(events.scheduled_at);
}

export async function getAllModels(db: Database) {
  return db.select().from(models);
}

export async function getModel(db: Database, modelId: string) {
  const result = await db.select().from(models).where(eq(models.id, modelId));
  return result[0] ?? null;
}

export async function getResponsesForEvent(db: Database, eventId: string) {
  return db
    .select()
    .from(responses)
    .where(eq(responses.event_id, eventId))
    .orderBy(responses.model_id);
}

export async function getVoteCounts(
  db: Database,
  eventId: string
): Promise<{ model_id: string; count: number }[]> {
  const result = await db
    .select({
      model_id: votes.model_id,
      count: count(),
    })
    .from(votes)
    .where(eq(votes.event_id, eventId))
    .groupBy(votes.model_id);
  return result.map((r) => ({ model_id: r.model_id, count: Number(r.count) }));
}

export async function getTotalVotes(db: Database): Promise<number> {
  const result = await db.select({ count: count() }).from(votes);
  return Number(result[0]?.count ?? 0);
}

export async function getMedalsForEvent(db: Database, eventId: string) {
  return db.select().from(medals).where(eq(medals.event_id, eventId));
}

export async function getLeaderboard(db: Database): Promise<LeaderboardRow[]> {
  const result = await db.execute(sql`
    SELECT
      m.id as model_id,
      m.name as model_name,
      m.country_code,
      m.flag_emoji,
      m.color,
      COALESCE(SUM(CASE WHEN md.medal = 'gold' THEN 1 ELSE 0 END), 0)::int as gold,
      COALESCE(SUM(CASE WHEN md.medal = 'silver' THEN 1 ELSE 0 END), 0)::int as silver,
      COALESCE(SUM(CASE WHEN md.medal = 'bronze' THEN 1 ELSE 0 END), 0)::int as bronze,
      COALESCE(SUM(CASE WHEN md.medal = 'gold' THEN 1 ELSE 0 END), 0)::int +
      COALESCE(SUM(CASE WHEN md.medal = 'silver' THEN 1 ELSE 0 END), 0)::int +
      COALESCE(SUM(CASE WHEN md.medal = 'bronze' THEN 1 ELSE 0 END), 0)::int as total
    FROM models m
    LEFT JOIN medals md ON m.id = md.model_id
    GROUP BY m.id, m.name, m.country_code, m.flag_emoji, m.color
    ORDER BY
      COALESCE(SUM(CASE WHEN md.medal = 'gold' THEN 1 ELSE 0 END), 0) DESC,
      COALESCE(SUM(CASE WHEN md.medal = 'silver' THEN 1 ELSE 0 END), 0) DESC,
      COALESCE(SUM(CASE WHEN md.medal = 'bronze' THEN 1 ELSE 0 END), 0) DESC,
      m.name ASC
  `);
  return result.rows as unknown as LeaderboardRow[];
}

export async function updateEventStatus(
  db: Database,
  eventId: string,
  status: "upcoming" | "generating" | "voting" | "closed"
) {
  await db.update(events).set({ status }).where(eq(events.id, eventId));
}

export async function insertResponse(
  db: Database,
  data: {
    event_id: string;
    model_id: string;
    round: number;
    content: string;
    generation_ms: number;
    auto_score: Record<string, number> | null;
  }
) {
  await db.insert(responses).values(data);
}

export async function insertVote(
  db: Database,
  data: {
    event_id: string;
    model_id: string;
    voter_fingerprint: string;
    scores: Record<string, number> | null;
  }
) {
  await db.insert(votes).values(data);
}

export async function insertMedal(
  db: Database,
  data: {
    event_id: string;
    model_id: string;
    medal: "gold" | "silver" | "bronze";
    final_score: number;
  }
) {
  await db.insert(medals).values(data);
}

export async function getActiveEvent(db: Database) {
  const result = await db
    .select()
    .from(events)
    .where(
      sql`${events.status} IN ('generating', 'voting')`
    )
    .orderBy(events.scheduled_at)
    .limit(1);
  return result[0] ?? null;
}

export async function getNextUpcomingEvent(db: Database) {
  const result = await db
    .select()
    .from(events)
    .where(eq(events.status, "upcoming"))
    .orderBy(events.scheduled_at)
    .limit(1);
  return result[0] ?? null;
}

export async function getResponseCount(db: Database, eventId: string) {
  const result = await db
    .select({ count: count() })
    .from(responses)
    .where(eq(responses.event_id, eventId));
  return Number(result[0]?.count ?? 0);
}

export async function hasVoterVoted(
  db: Database,
  eventId: string,
  fingerprint: string
): Promise<boolean> {
  const result = await db
    .select({ count: count() })
    .from(votes)
    .where(
      and(
        eq(votes.event_id, eventId),
        eq(votes.voter_fingerprint, fingerprint)
      )
    );
  return Number(result[0]?.count ?? 0) > 0;
}
