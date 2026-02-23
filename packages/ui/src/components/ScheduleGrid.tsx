"use client";

import React from "react";
import { usePolling } from "@ai-olympics/shared/hooks";
import { POLL_INTERVAL_EVENTS } from "@ai-olympics/shared";
import { ScheduleRow } from "./ScheduleRow";
import type { EventStatus } from "@ai-olympics/shared";

interface EventData {
  id: string;
  name: string;
  icon: string;
  scheduled_at: string;
  status: EventStatus;
}

interface ScheduleGridProps {
  initialEvents: EventData[];
}

export function ScheduleGrid({ initialEvents }: ScheduleGridProps) {
  const { data } = usePolling<EventData[]>("/api/events", POLL_INTERVAL_EVENTS);
  const events = data ?? initialEvents;

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase() +
      " " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  };

  return (
    <div>
      {events.map((ev) => (
        <ScheduleRow
          key={ev.id}
          icon={ev.icon}
          name={ev.name}
          scheduledAt={formatTime(ev.scheduled_at)}
          status={ev.status}
          href={ev.status !== "upcoming" ? `/event/${ev.id}` : undefined}
        />
      ))}
    </div>
  );
}
