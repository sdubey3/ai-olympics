import { NextResponse } from "next/server";
import { getDb } from "@ai-olympics/shared/db";
import { getAllEvents } from "@ai-olympics/shared/db/queries";

export async function GET() {
  const db = getDb();
  const events = await getAllEvents(db);
  return NextResponse.json(events);
}
