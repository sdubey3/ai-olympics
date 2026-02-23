import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { checkAndTransitionEvents } from "@/lib/transitions";

export async function POST(req: NextRequest) {
  // Authenticate cron
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const transitions = await checkAndTransitionEvents(db);

  return NextResponse.json({
    ok: true,
    transitions,
    timestamp: new Date().toISOString(),
  });
}
