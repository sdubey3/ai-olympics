"use client";

import React, { useState } from "react";
import { SLIDER_DIMENSIONS } from "@ai-olympics/shared";

interface SliderVoteProps {
  blindLabel: string;
  onSubmit: (scores: Record<string, number>) => void;
}

export function SliderVote({ blindLabel, onSubmit }: SliderVoteProps) {
  const [scores, setScores] = useState<Record<string, number>>({});

  const allFilled = SLIDER_DIMENSIONS.every((d) => scores[d.key] && scores[d.key] > 0);

  return (
    <div style={{ marginTop: 8 }}>
      {SLIDER_DIMENSIONS.map((dim) => (
        <div key={dim.key} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 6, color: "#888", marginBottom: 4 }}>
            {dim.emoji} {dim.label.toUpperCase()}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setScores((prev) => ({ ...prev, [dim.key]: n }))}
                style={{
                  width: 16,
                  height: 16,
                  background: (scores[dim.key] ?? 0) >= n ? "#FFD700" : "#333",
                  border: "2px solid",
                  borderColor: (scores[dim.key] ?? 0) >= n ? "#FFD700" : "#555",
                  cursor: "pointer",
                  imageRendering: "pixelated",
                  padding: 0,
                }}
                title={`${n}/5`}
              />
            ))}
          </div>
        </div>
      ))}
      <button
        className="pixel-btn"
        disabled={!allFilled}
        onClick={() => allFilled && onSubmit(scores)}
        style={{
          background: "transparent",
          color: allFilled ? "#FFD700" : "#555",
          borderColor: allFilled ? "#FFD700" : "#555",
          boxShadow: allFilled ? "4px 4px 0 #FFD700" : "4px 4px 0 #555",
          fontSize: 8,
          width: "100%",
          opacity: allFilled ? 1 : 0.5,
          cursor: allFilled ? "pointer" : "not-allowed",
        }}
      >
        SUBMIT SCORES ►
      </button>
    </div>
  );
}
