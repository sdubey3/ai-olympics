export const BLIND_LABELS = ["Model A", "Model B", "Model C", "Model D", "Model E"] as const;

export const MEDAL_EMOJI: Record<string, string> = {
  gold: "🥇",
  silver: "🥈",
  bronze: "🥉",
};

export const MODEL_COLORS: Record<string, string> = {
  "gpt-4o": "#10A37F",
  "claude-3.5-sonnet": "#D97706",
  "gemini-1.5-pro": "#4285F4",
  "deepseek-r1": "#E53E3E",
  "mistral-large": "#7C3AED",
};

export const SCORING_CONFIG = {
  gold_weight: 3,
  silver_weight: 2,
  bronze_weight: 1,
} as const;

export const SLIDER_DIMENSIONS = [
  { key: "beauty", label: "Beauty", emoji: "⭐" },
  { key: "emotion", label: "Emotional Impact", emoji: "❤️" },
  { key: "originality", label: "Originality", emoji: "💡" },
] as const;

export const NUM_MODELS = 5;
export const POLL_INTERVAL_VOTES = 3000;
export const POLL_INTERVAL_EVENTS = 5000;
export const POLL_INTERVAL_GENERATION = 2000;
