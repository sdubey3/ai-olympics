import { notFound } from "next/navigation";
import { Header, LiveBanner, Footer, EventArena } from "@ai-olympics/ui";
import { getDb } from "@ai-olympics/shared/db";
import {
  getEvent,
  getActiveEvent,
  getNextUpcomingEvent,
  getResponsesForEvent,
  getTotalVotes,
} from "@ai-olympics/shared/db/queries";
import { getBlindMapping, BLIND_LABELS } from "@ai-olympics/shared";
import type { BlindModel } from "@ai-olympics/shared";
import { MODEL_IDS, EVENTS } from "@/lib/event-config";

export const dynamic = "force-dynamic";

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let event: Awaited<ReturnType<typeof getEvent>> | null = null;
  let activeEvent: Awaited<ReturnType<typeof getActiveEvent>> | null = null;
  let nextEvent: Awaited<ReturnType<typeof getNextUpcomingEvent>> | null = null;
  let totalVotes = 0;
  let blindResponses: BlindModel[] = [];

  try {
    const db = getDb();
    event = await getEvent(db, slug);
    if (!event) notFound();

    [activeEvent, nextEvent, totalVotes] = await Promise.all([
      getActiveEvent(db),
      getNextUpcomingEvent(db),
      getTotalVotes(db),
    ]);

    // Fetch responses and convert to blind format
    if (event.status !== "upcoming") {
      const responses = await getResponsesForEvent(db, slug);
      const responsesMap = Object.fromEntries(
        responses.map((r) => [r.model_id, r])
      );
      const modelIds = MODEL_IDS as unknown as string[];
      const mapping = getBlindMapping(slug, modelIds);
      blindResponses = mapping.map(({ blindIndex, modelId }) => ({
        index: blindIndex,
        label: BLIND_LABELS[blindIndex],
        content: responsesMap[modelId]?.content ?? "",
      }));
    }
  } catch {
    notFound();
  }

  if (!event) notFound();

  // Find event index
  const eventIndex = EVENTS.findIndex((e) => e.id === slug);

  const navItems = [
    { id: "schedule", label: "SCHEDULE", href: "/" },
    {
      id: "event",
      label: "► LIVE EVENT",
      href: `/event/${slug}`,
      active: true,
    },
    { id: "leaderboard", label: "MEDALS", href: "/leaderboard" },
    { id: "teams", label: "TEAMS", href: "/teams" },
  ];

  const nextEventText = nextEvent
    ? `${nextEvent.name} ${new Date(nextEvent.scheduled_at).toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}`
    : undefined;

  return (
    <div>
      <Header
        edition="MILAN CORTINA 2026"
        title="AI OLYMPICS"
        subtitle="5 MODELS. 6 EVENTS. ONE CHAMPION."
        navItems={navItems}
        isLive={!!activeEvent}
      />

      {activeEvent && activeEvent.id === slug && (
        <LiveBanner
          eventName={activeEvent.name}
          eventIcon={activeEvent.icon}
          statusText={activeEvent.status === "voting" ? "VOTING OPEN" : "GENERATING"}
          closesAt={activeEvent.status === "voting" ? activeEvent.voting_closes_at : null}
        />
      )}

      <div
        className="scroll-hidden"
        style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto", paddingBottom: 40 }}
      >
        <EventArena
          eventId={event.id}
          eventName={event.name}
          eventIcon={event.icon}
          eventDescription={event.sport_description}
          eventNumber={eventIndex + 1}
          totalEvents={EVENTS.length}
          scheduledAt={event.scheduled_at instanceof Date ? event.scheduled_at.toISOString() : String(event.scheduled_at)}
          votingClosesAt={event.voting_closes_at instanceof Date ? event.voting_closes_at.toISOString() : String(event.voting_closes_at)}
          scoringType={event.scoring_type as "pick" | "slider" | "hybrid" | "auto_vote"}
          initialStatus={event.status as "upcoming" | "generating" | "voting" | "closed"}
          initialResponses={blindResponses}
        />
      </div>

      <Footer
        domain="AI-OLYMPICS.DEV"
        totalVotes={totalVotes}
        nextEvent={nextEventText}
      />
    </div>
  );
}
