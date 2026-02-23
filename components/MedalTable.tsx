"use client";

import React from "react";
import type { LeaderboardRow } from "@/lib/types";

interface MedalTableProps {
  rows: LeaderboardRow[];
}

export function MedalTable({ rows }: MedalTableProps) {
  return (
    <div>
      {/* Header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr repeat(3, 40px) 60px",
          gap: 0,
          fontSize: 7,
          color: "#888",
          paddingBottom: 10,
          borderBottom: "2px solid #333",
          marginBottom: 4,
          alignItems: "center",
        }}
      >
        <div style={{ paddingRight: 12 }}>#</div>
        <div>MODEL</div>
        <div style={{ textAlign: "center" }}>🥇</div>
        <div style={{ textAlign: "center" }}>🥈</div>
        <div style={{ textAlign: "center" }}>🥉</div>
        <div style={{ textAlign: "right" }}>TOTAL</div>
      </div>

      {/* Data rows */}
      {rows.map((row, i) => (
        <div
          key={row.model_id}
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr repeat(3, 40px) 60px",
            gap: 0,
            alignItems: "center",
            padding: i === 0 ? "14px 12px" : "14px 0",
            borderBottom: "1px solid #1a1a1a",
            border: i === 0 ? `2px solid ${row.color}` : undefined,
            background: i === 0 ? "#0a0a0a" : "transparent",
          }}
        >
          <div
            style={{
              fontSize: i === 0 ? 12 : 9,
              color: i === 0 ? "#FFD700" : "#555",
              paddingRight: 12,
              minWidth: 24,
            }}
          >
            {i === 0 ? "★" : i + 1}
          </div>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 14 }}>{row.flag_emoji}</span>
              <span style={{ fontSize: 8, color: i === 0 ? row.color : "#fff" }}>
                {row.model_name}
              </span>
            </div>
            <div style={{ fontSize: 6, color: "#555" }}>{row.country_code}</div>
          </div>
          <div style={{ textAlign: "center", fontSize: 10 }}>{row.gold || "-"}</div>
          <div style={{ textAlign: "center", fontSize: 10 }}>{row.silver || "-"}</div>
          <div style={{ textAlign: "center", fontSize: 10 }}>{row.bronze || "-"}</div>
          <div style={{ textAlign: "right", fontSize: 9, color: "#888" }}>
            {row.total || "-"}
          </div>
        </div>
      ))}

      {/* Scoring info */}
      <div style={{ marginTop: 24, padding: 16, border: "2px solid #222" }}>
        <div style={{ fontSize: 7, color: "#555", lineHeight: 2.5 }}>
          SCORING: GOLD OUTRANKS ALL.
          <br />
          1🥇 &gt; 10🥈. JUST LIKE THE REAL THING.
        </div>
      </div>
    </div>
  );
}
