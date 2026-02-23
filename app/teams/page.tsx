import { Header, Footer, TeamCard } from "@/components";
import { getDb } from "@/lib/db";
import {
  getActiveEvent,
  getNextUpcomingEvent,
  getTotalVotes,
} from "@/lib/db/queries";
import { TEAMS } from "@/lib/event-config";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  let activeEvent: Awaited<ReturnType<typeof getActiveEvent>> | null = null;
  let nextEvent: Awaited<ReturnType<typeof getNextUpcomingEvent>> | null = null;
  let totalVotes = 0;

  try {
    const db = getDb();
    [activeEvent, nextEvent, totalVotes] = await Promise.all([
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
    { id: "leaderboard", label: "MEDALS", href: "/leaderboard" },
    { id: "teams", label: "TEAMS", href: "/teams", active: true },
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
            ★ COUNTRY ROSTERS ★
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {TEAMS.map((team) => (
              <TeamCard key={team.country_code} team={team} />
            ))}
          </div>
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
