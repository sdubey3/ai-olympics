"use client";

import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  label: string;
  targetDate: Date | string;
}

export function CountdownTimer({ label, targetDate }: CountdownTimerProps) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;

    function update() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setTime({ h: 0, m: 0, s: 0 });
        return;
      }
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div style={{ textAlign: "center", padding: 24 }}>
      <div style={{ fontSize: 9, color: "#888", marginBottom: 12, letterSpacing: 2 }}>
        {label}
      </div>
      <div
        className="blink"
        style={{ fontSize: 28, letterSpacing: 8, color: "#FFD700" }}
      >
        {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
      </div>
    </div>
  );
}
