import React from "react";

interface FooterProps {
  domain: string;
  totalVotes: number;
  nextEvent?: string;
}

export function Footer({ domain, totalVotes, nextEvent }: FooterProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: "2px solid #222",
        background: "#000",
        padding: "6px 24px",
        display: "flex",
        justifyContent: "space-between",
        fontSize: 6,
        color: "#444",
        fontFamily: "'Press Start 2P', monospace",
        zIndex: 100,
      }}
    >
      <span>{domain}</span>
      <span>{totalVotes} VOTES CAST</span>
      <span>{nextEvent ? `NEXT: ${nextEvent}` : "ALL EVENTS COMPLETE"}</span>
    </div>
  );
}
