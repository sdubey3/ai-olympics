import React from "react";
import type { MedalType } from "@ai-olympics/shared";

const MEDAL_COLORS: Record<MedalType, string> = {
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
};

interface PixelMedalProps {
  type: MedalType;
  size?: number;
}

export function PixelMedal({ type, size = 16 }: PixelMedalProps) {
  const color = MEDAL_COLORS[type] ?? "#333";
  return (
    <span
      title={type}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        background: color,
        border: `2px solid ${color}`,
        boxShadow: "2px 2px 0 rgba(0,0,0,0.5)",
        imageRendering: "pixelated",
        flexShrink: 0,
      }}
    />
  );
}
