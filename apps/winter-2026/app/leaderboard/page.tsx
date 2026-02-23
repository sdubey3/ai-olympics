import { Header, Footer, MedalTable } from "@ai-olympics/ui";
import { getDb } from "@ai-olympics/shared/db";
import {
  getLeaderboard,
  getActiveEvent,
  getNextUpcomingEvent,
  getTotalVotes,
} from "@ai-olympics/shared/db/queries";
import { LeaderboardClient } from "./client";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  let leaderboard: Awaited<ReturnType<typeof getLeaderboard>> = [];
  let activeEvent: Awaited<ReturnType<typeof getActiveEvent>> | null = null;
  let nextEvent: Awaited<ReturnType<typeof getNextUpcomingEvent>> | null = null;
  let totalVotes = 0;

  try {
    const db = getDb();
    [leaderboard, activeEvent, nextEvent, totalVotes] = await Promise.all([
      getLeaderboard(db),
      getActiveEvent(db),
      getNextUpcomingEvent(db),
      getTotalVotes(db),
    ]);
  } catch {
    // DB not connected
  }

  const navItems = [
    { id: "schedule", label: "SCHEDULE", href: "/" },
    {
      id: "event",
      label: "► LIVE EVENT",
      href: activeEvent ? `/event/${activeEvent.id}` : "#",
    },
    { id: "leaderboard", label: "MEDALS", href: "/leaderboard", active: true },
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
            ★ MEDAL TABLE ★
          </div>
          <LeaderboardClient initialData={leaderboard} />
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
