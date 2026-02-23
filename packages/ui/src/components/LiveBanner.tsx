"use client";

import React, { useState, useEffect } from "react";

interface LiveBannerProps {
  eventName: string;
  eventIcon: string;
  statusText: string;
  closesAt?: Date | string | null;
}

function formatCountdown(target: Date): string {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return "00:00:00";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function LiveBanner({ eventName, eventIcon, statusText, closesAt }: LiveBannerProps) {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!closesAt) return;
    const target = typeof closesAt === "string" ? new Date(closesAt) : closesAt;
    setCountdown(formatCountdown(target));
    const interval = setInterval(() => {
      setCountdown(formatCountdown(target));
    }, 1000);
    return () => clearInterval(interval);
  }, [closesAt]);

  return (
    <div
      style={{
        background: "#FFD700",
        color: "#000",
        padding: "8px 24px",
        fontSize: 7,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "'Press Start 2P', monospace",
      }}
    >
      <span>
        {eventIcon} {eventName} — {statusText}
      </span>
      {closesAt && <span className="blink">CLOSES IN {countdown}</span>}
    </div>
  );
}
