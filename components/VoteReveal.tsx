"use client";

import React, { useState, useEffect } from "react";
import type { RevealedModel } from "@/lib/types";

interface VoteRevealProps {
  revealData: RevealedModel[];
  votedModelIndex: number;
  onRevealComplete: () => void;
}

/**
 * Post-vote reveal animation.
 * Staggered reveal at 800ms intervals — each model card
 * transitions from blind to revealed state.
 */
export function VoteReveal({
  revealData,
  votedModelIndex,
  onRevealComplete,
}: VoteRevealProps) {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    if (revealedCount >= revealData.length) {
      // All revealed — notify parent after a short delay for medal animation
      const timeout = setTimeout(onRevealComplete, 500);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setRevealedCount((c) => c + 1);
    }, 800);

    return () => clearTimeout(timeout);
  }, [revealedCount, revealData.length, onRevealComplete]);

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontSize: 8,
          color: "#FFD700",
          textAlign: "center",
          marginBottom: 16,
          letterSpacing: 2,
        }}
      >
        ★ REVEALING MODELS ★
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {revealData.map((model, i) => {
          const isRevealed = i < revealedCount;
          const totalVotes = revealData.reduce((sum, m) => sum + m.votes, 0);

          return (
            <div
              key={model.index}
              style={{
                border: `3px solid ${isRevealed ? model.color : "#333"}`,
                boxShadow: isRevealed ? `4px 4px 0 ${model.color}` : "none",
                padding: 12,
                transition: "all 0.3s ease-out",
                background: isRevealed && i === revealedCount - 1 ? "rgba(255,255,255,0.05)" : "transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 14, transition: "all 0.3s" }}>
                  {isRevealed ? model.flag_emoji : "🏳️"}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: 7,
                      color: isRevealed ? model.color : "#fff",
                      transition: "color 0.3s",
                    }}
                  >
                    {isRevealed ? model.name : model.label}
                  </div>
                  <div style={{ fontSize: 6, color: "#666" }}>
                    {isRevealed ? model.country_code : "???"}
                  </div>
                </div>
                {isRevealed && model.index === votedModelIndex && (
                  <div style={{ marginLeft: "auto", fontSize: 7, color: model.color }}>
                    ★ VOTED
                  </div>
                )}
              </div>

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
                {model.content}
              </div>

              {isRevealed && totalVotes > 0 && (
                <div>
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
                        width: `${Math.round((model.votes / totalVotes) * 100)}%`,
                        height: "100%",
                        background: model.color,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 6, color: "#888" }}>
                    {model.votes} votes ({Math.round((model.votes / totalVotes) * 100)}%)
                  </div>
                </div>
              )}

              {isRevealed && model.medal && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 7,
                    color: model.medal === "gold" ? "#FFD700" : model.medal === "silver" ? "#C0C0C0" : "#CD7F32",
                    textAlign: "center",
                  }}
                >
                  {model.medal === "gold" ? "🥇" : model.medal === "silver" ? "🥈" : "🥉"}{" "}
                  {model.medal.toUpperCase()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
