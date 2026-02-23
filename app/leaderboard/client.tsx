"use client";

import { MedalTable } from "@/components";
import { usePolling } from "@/lib/hooks/usePolling";
import { POLL_INTERVAL_EVENTS } from "@/lib/constants";
import type { LeaderboardRow } from "@/lib/types";

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
