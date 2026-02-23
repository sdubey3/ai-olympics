import React from "react";
import type { TeamConfig } from "@/lib/types";

interface TeamCardProps {
  team: TeamConfig;
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <div
      style={{
        border: "3px solid #333",
        padding: 16,
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: 28 }}>{team.flag_emoji}</span>
        <div>
          <div style={{ fontSize: 9, marginBottom: 4 }}>{team.country.toUpperCase()}</div>
          <div style={{ fontSize: 6, color: "#888" }}>{team.country_code}</div>
        </div>
      </div>
      <div style={{ fontSize: 7, color: "#aaa", marginBottom: 12, fontStyle: "italic" }}>
        &quot;{team.tagline}&quot;
      </div>
      <div style={{ borderTop: "1px solid #222", paddingTop: 12 }}>
        {team.models.map((model) => (
          <div
            key={model.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: "1px solid #1a1a1a",
            }}
          >
            <span style={{ fontSize: 7, color: model.competing ? "#fff" : "#555" }}>
              {model.name}
            </span>
            {model.competing && (
              <span style={{ fontSize: 6, color: "#FFD700" }}>★ COMPETING</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
