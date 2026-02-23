import React from "react";
import type { EventStatus } from "@/lib/types";

interface ScheduleRowProps {
  icon: string;
  name: string;
  scheduledAt: string;
  status: EventStatus;
  href?: string;
}

export function ScheduleRow({ icon, name, scheduledAt, status, href }: ScheduleRowProps) {
  const statusConfig = {
    voting: { text: "► VOTE NOW", color: "#FFD700", borderColor: "#FFD700", animation: "pixelflash 2s infinite" },
    generating: { text: "► GENERATING", color: "#FFD700", borderColor: "#FFD700", animation: "pixelflash 2s infinite" },
    upcoming: { text: "LOCKED", color: "#888", borderColor: "#555", animation: "none" },
    closed: { text: "CLOSED", color: "#555", borderColor: "#444", animation: "none" },
  };

  const config = statusConfig[status];

  const inner = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 0",
        borderBottom: "2px solid #222",
        opacity: status === "closed" ? 0.5 : 1,
        cursor: href ? "pointer" : "default",
      }}
    >
      <div style={{ fontSize: 20, width: 32 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9, marginBottom: 6 }}>{name}</div>
        <div style={{ fontSize: 7, color: "#888" }}>{scheduledAt}</div>
      </div>
      <div
        style={{
          fontSize: 7,
          padding: "6px 10px",
          border: "2px solid",
          borderColor: config.borderColor,
          color: config.color,
          animation: config.animation,
        }}
      >
        {config.text}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} style={{ textDecoration: "none", color: "inherit" }}>
        {inner}
      </a>
    );
  }

  return inner;
}
