"use client";

import React from "react";
import { VoteBar } from "./VoteBar";

interface ModelCardProps {
  // Blind mode
  blindLabel: string;
  content: string;
  isStreaming?: boolean;

  // Revealed mode
  revealed?: boolean;
  modelName?: string;
  flagEmoji?: string;
  countryCode?: string;
  color?: string;
  votedFor?: boolean;

  // Vote data (shown after reveal)
  votes?: number;
  totalVotes?: number;

  // Voting
  onVote?: () => void;
  votingEnabled?: boolean;
  scoringType?: string;
}

export function ModelCard({
  blindLabel,
  content,
  isStreaming = false,
  revealed = false,
  modelName,
  flagEmoji,
  countryCode,
  color,
  votedFor = false,
  votes = 0,
  totalVotes = 0,
  onVote,
  votingEnabled = false,
}: ModelCardProps) {
  const displayFlag = revealed ? flagEmoji : "🏳️";
  const displayName = revealed ? modelName : blindLabel;
  const displayCountry = revealed ? countryCode : "???";
  const borderColor = revealed ? color ?? "#333" : "#333";
  const nameColor = revealed ? color ?? "#fff" : "#fff";
  const boxShadow = revealed && color ? `4px 4px 0 ${color}` : "none";
  const btnColor = revealed ? color ?? "#888" : "#888";

  return (
    <div
      className={revealed ? "reveal-flash" : ""}
      style={{
        border: `3px solid ${borderColor}`,
        boxShadow,
        padding: 12,
        transition: "all 0.3s",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 14, transition: "all 0.3s" }}>{displayFlag}</span>
        <div>
          <div style={{ fontSize: 7, color: nameColor, transition: "color 0.3s" }}>
            {displayName}
          </div>
          <div style={{ fontSize: 6, color: "#666" }}>{displayCountry}</div>
        </div>
        {votedFor && revealed && (
          <div style={{ marginLeft: "auto", fontSize: 7, color: color ?? "#FFD700" }}>
            ★ VOTED
          </div>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          fontSize: 7,
          color: "#ccc",
          lineHeight: 2.2,
          minHeight: 60,
          borderTop: "1px solid #222",
          paddingTop: 10,
          marginBottom: 12,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {content}
        {isStreaming && <span className="streaming-cursor" />}
      </div>

      {/* Vote bars (after reveal) */}
      {revealed && totalVotes > 0 && (
        <VoteBar votes={votes} totalVotes={totalVotes} color={color ?? "#888"} />
      )}

      {/* Vote button (blind mode, during voting) */}
      {votingEnabled && !revealed && (
        <button
          className="pixel-btn"
          onClick={onVote}
          style={{
            background: "transparent",
            color: btnColor,
            borderColor: btnColor,
            boxShadow: `4px 4px 0 ${btnColor}`,
            fontSize: 8,
            width: "100%",
          }}
        >
          VOTE ►
        </button>
      )}
    </div>
  );
}
