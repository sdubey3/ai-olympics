import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAllEvents } from "@/lib/db/queries";
import { checkAndTransitionEvents } from "@/lib/transitions";

export async function GET() {
  const db = getDb();
  await checkAndTransitionEvents(db);
  const events = await getAllEvents(db);
  return NextResponse.json(events);
}
