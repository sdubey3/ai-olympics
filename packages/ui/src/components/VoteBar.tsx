import React from "react";

interface VoteBarProps {
  votes: number;
  totalVotes: number;
  color: string;
}

export function VoteBar({ votes, totalVotes, color }: VoteBarProps) {
  const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          background: "#111",
          height: 8,
          border: "2px solid #333",
          marginBottom: 4,
        }}
      >
        <div
          className="vote-bar-fill"
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
          }}
        />
      </div>
      <div style={{ fontSize: 6, color: "#888" }}>
        {votes} votes ({pct}%)
      </div>
    </div>
  );
}
