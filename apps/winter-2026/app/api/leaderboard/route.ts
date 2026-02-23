import { NextResponse } from "next/server";
import { getDb } from "@ai-olympics/shared/db";
import { getLeaderboard, getTotalVotes } from "@ai-olympics/shared/db/queries";

export async function GET() {
  const db = getDb();
  const [leaderboard, totalVotes] = await Promise.all([
    getLeaderboard(db),
    getTotalVotes(db),
  ]);
  return NextResponse.json({ leaderboard, totalVotes });
}
