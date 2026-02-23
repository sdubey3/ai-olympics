"use client";

import { MedalTable } from "@ai-olympics/ui";
import { usePolling } from "@ai-olympics/shared/hooks";
import { POLL_INTERVAL_EVENTS } from "@ai-olympics/shared";
import type { LeaderboardRow } from "@ai-olympics/shared";

interface LeaderboardClientProps {
  initialData: LeaderboardRow[];
}

export function LeaderboardClient({ initialData }: LeaderboardClientProps) {
  const { data } = usePolling<{ leaderboard: LeaderboardRow[] }>(
    "/api/leaderboard",
    POLL_INTERVAL_EVENTS
  );

  const rows = data?.leaderboard ?? initialData;

  return <MedalTable rows={rows} />;
}
