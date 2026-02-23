import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAllEvents } from "@/lib/db/queries";

export async function GET() {
  const db = getDb();
  const events = await getAllEvents(db);
  return NextResponse.json(events);
}
