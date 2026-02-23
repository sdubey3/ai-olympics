import { Header, LiveBanner, Footer, ScheduleGrid, MedalTable } from "@/components";
import { getDb } from "@/lib/db";
import {
  getAllEvents,
  getActiveEvent,
  getNextUpcomingEvent,
  getLeaderboard,
  getTotalVotes,
} from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let events: Awaited<ReturnType<typeof getAllEvents>> = [];
  let activeEvent: Awaited<ReturnType<typeof getActiveEvent>> | null = null;
  let nextEvent: Awaited<ReturnType<typeof getNextUpcomingEvent>> | null = null;
  let leaderboard: Awaited<ReturnType<typeof getLeaderboard>> = [];
  let totalVotes = 0;

  try {
    const db = getDb();
    [events, activeEvent, nextEvent, leaderboard, totalVotes] = await Promise.all([
      getAllEvents(db),
      getActiveEvent(db),
      getNextUpcomingEvent(db),
      getLeaderboard(db),
      getTotalVotes(db),
    ]);
  } catch {
    // DB not connected yet — show empty state
  }

  const navItems = [
    { id: "schedule", label: "SCHEDULE", href: "/", active: true },
    {
      id: "event",
      label: "► LIVE EVENT",
      href: activeEvent ? `/event/${activeEvent.id}` : "#",
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

      {activeEvent && (
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
        <div style={{ padding: 24 }}>
          <div
            style={{
              fontSize: 9,
              color: "#888",
              marginBottom: 20,
              letterSpacing: 2,
            }}
          >
            ★ OFFICIAL SCHEDULE ★
          </div>

          <ScheduleGrid
            initialEvents={events.map((e) => ({
              id: e.id,
              name: e.name,
              icon: e.icon,
              scheduled_at: e.scheduled_at instanceof Date ? e.scheduled_at.toISOString() : String(e.scheduled_at),
              status: e.status as "upcoming" | "generating" | "voting" | "closed",
            }))}
          />

          {/* Mini leaderboard preview */}
          {leaderboard.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div
                style={{
                  fontSize: 9,
                  color: "#888",
                  marginBottom: 20,
                  letterSpacing: 2,
                }}
              >
                ★ MEDAL TABLE ★
              </div>
              <MedalTable rows={leaderboard} />
            </div>
          )}
        </div>
      </div>

      <Footer
        domain="AI-OLYMPICS.DEV"
        totalVotes={totalVotes}
        nextEvent={nextEventText}
      />
    </div>
  );
}
