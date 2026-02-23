import type { EventConfig, TeamConfig } from "@ai-olympics/shared";

// ---- Competing model IDs ----
export const MODEL_IDS = [
  "gpt-4o",
  "claude-3.5-sonnet",
  "gemini-1.5-pro",
  "deepseek-r1",
  "mistral-large",
] as const;

// ---- OpenRouter model mapping ----
export const OPENROUTER_MODELS: Record<string, string> = {
  "gpt-4o": "openai/gpt-4o",
  "claude-3.5-sonnet": "anthropic/claude-3.5-sonnet",
  "gemini-1.5-pro": "google/gemini-pro-1.5",
  "deepseek-r1": "deepseek/deepseek-r1",
  "mistral-large": "mistralai/mistral-large-latest",
};

// ---- Model display info ----
export const MODEL_INFO: Record<
  string,
  { name: string; country: string; country_code: string; flag_emoji: string; color: string }
> = {
  "gpt-4o": {
    name: "GPT-4o",
    country: "United States",
    country_code: "USA",
    flag_emoji: "🇺🇸",
    color: "#10A37F",
  },
  "claude-3.5-sonnet": {
    name: "Claude 3.5",
    country: "United States",
    country_code: "USA",
    flag_emoji: "🇺🇸",
    color: "#D97706",
  },
  "gemini-1.5-pro": {
    name: "Gemini 1.5",
    country: "United States",
    country_code: "USA",
    flag_emoji: "🇺🇸",
    color: "#4285F4",
  },
  "deepseek-r1": {
    name: "DeepSeek R1",
    country: "China",
    country_code: "CHN",
    flag_emoji: "🇨🇳",
    color: "#E53E3E",
  },
  "mistral-large": {
    name: "Mistral Large",
    country: "France",
    country_code: "FRA",
    flag_emoji: "🇫🇷",
    color: "#7C3AED",
  },
};

// ---- 6 Winter Olympic events ----
export const EVENTS: EventConfig[] = [
  {
    id: "big-air",
    name: "BIG AIR",
    icon: "🏂",
    sport_description:
      "Write a haiku about winter. Must follow 5-7-5 syllable structure. Precision is everything.",
    prompts: [
      {
        round: 1,
        system:
          "You are a poet. Write ONLY a haiku (three lines: 5 syllables, 7 syllables, 5 syllables). No title, no explanation — just the haiku.",
        user: "Write a haiku about winter.",
        max_tokens: 100,
      },
    ],
    scoring_type: "hybrid",
    scheduled_at: "2026-03-01T01:00:00Z",
    voting_duration_minutes: 120,
  },
  {
    id: "figure-skating",
    name: "FIGURE SKATING",
    icon: "⛸",
    sport_description:
      "Write a short poem or prose piece about loneliness. Judged on beauty, emotional impact, and originality.",
    prompts: [
      {
        round: 1,
        system:
          "You are a literary writer. Write a short, evocative piece (poem or prose, 2-6 sentences) about loneliness. No title. Be original and emotionally resonant.",
        user: "Write a short piece about loneliness.",
        max_tokens: 300,
      },
    ],
    scoring_type: "slider",
    scheduled_at: "2026-03-01T19:00:00Z",
    voting_duration_minutes: 120,
  },
  {
    id: "biathlon",
    name: "BIATHLON",
    icon: "🎯",
    sport_description:
      "Two disciplines: write a function that checks if a number is prime, then write a haiku about coding. Accuracy + artistry.",
    prompts: [
      {
        round: 1,
        system:
          "Write a function in Python that checks if a number is prime. Return only the code, no explanation.",
        user: "Write an is_prime function in Python.",
        max_tokens: 300,
      },
      {
        round: 2,
        system:
          "You are a poet. Write ONLY a haiku (three lines: 5 syllables, 7 syllables, 5 syllables) about coding or programming. No title, no explanation.",
        user: "Write a haiku about coding.",
        max_tokens: 100,
      },
    ],
    scoring_type: "hybrid",
    scheduled_at: "2026-03-01T23:00:00Z",
    voting_duration_minutes: 120,
  },
  {
    id: "slalom",
    name: "THE LUGE",
    icon: "🛷",
    sport_description:
      'Navigate 8 gates: story must open with dialogue, mention temperature, use the word "fracture", include a question, name a color, stay under 300 words, contain a plot twist, and end on a single sentence.',
    prompts: [
      {
        round: 1,
        system:
          'Write a short story (under 300 words) that satisfies ALL of these requirements: 1) Opens with dialogue 2) Mentions temperature 3) Uses the word "fracture" 4) Includes a question 5) Names a color 6) Under 300 words 7) Contains a plot twist 8) Ends on a single sentence. No title.',
        user: "Write a constrained short story following the 8 gate requirements.",
        max_tokens: 500,
      },
    ],
    scoring_type: "auto_vote",
    scheduled_at: "2026-03-02T19:00:00Z",
    voting_duration_minutes: 120,
  },
  {
    id: "speed-skating",
    name: "SPEED SKATING",
    icon: "🏃",
    sport_description:
      "Explain quantum computing to a 10-year-old in exactly 3 sentences. Clarity and conciseness win.",
    prompts: [
      {
        round: 1,
        system:
          "Explain quantum computing to a 10-year-old in EXACTLY 3 sentences. Be clear, accurate, and engaging. No more, no less than 3 sentences.",
        user: "Explain quantum computing to a 10-year-old in 3 sentences.",
        max_tokens: 200,
      },
    ],
    scoring_type: "pick",
    scheduled_at: "2026-03-02T23:00:00Z",
    voting_duration_minutes: 120,
  },
  {
    id: "curling",
    name: "CURLING",
    icon: "🥌",
    sport_description:
      "Strategic precision: write a persuasive argument for why pineapple belongs on pizza. Wit and logic win.",
    prompts: [
      {
        round: 1,
        system:
          "Write a short, witty, and persuasive argument (3-5 sentences) for why pineapple belongs on pizza. Be clever and logical. No title.",
        user: "Argue why pineapple belongs on pizza.",
        max_tokens: 300,
      },
    ],
    scoring_type: "pick",
    scheduled_at: "2026-03-03T01:00:00Z",
    voting_duration_minutes: 120,
  },
];

// ---- Team rosters ----
export const TEAMS: TeamConfig[] = [
  {
    country: "United States",
    country_code: "USA",
    flag_emoji: "🇺🇸",
    tagline: "Three models, one dream",
    models: [
      { id: "gpt-4o", name: "GPT-4o", competing: true },
      { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", competing: true },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", competing: true },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", competing: false },
      { id: "claude-3-opus", name: "Claude 3 Opus", competing: false },
    ],
  },
  {
    country: "China",
    country_code: "CHN",
    flag_emoji: "🇨🇳",
    tagline: "The dragon rises",
    models: [
      { id: "deepseek-r1", name: "DeepSeek R1", competing: true },
      { id: "deepseek-v3", name: "DeepSeek V3", competing: false },
      { id: "qwen-72b", name: "Qwen 72B", competing: false },
      { id: "yi-large", name: "Yi Large", competing: false },
    ],
  },
  {
    country: "France",
    country_code: "FRA",
    flag_emoji: "🇫🇷",
    tagline: "L'intelligence artificielle",
    models: [
      { id: "mistral-large", name: "Mistral Large", competing: true },
      { id: "mistral-medium", name: "Mistral Medium", competing: false },
      { id: "mixtral-8x7b", name: "Mixtral 8x7B", competing: false },
    ],
  },
  {
    country: "United Arab Emirates",
    country_code: "UAE",
    flag_emoji: "🇦🇪",
    tagline: "Desert intelligence",
    models: [
      { id: "falcon-180b", name: "Falcon 180B", competing: false },
      { id: "falcon-40b", name: "Falcon 40B", competing: false },
    ],
  },
  {
    country: "Japan",
    country_code: "JPN",
    flag_emoji: "🇯🇵",
    tagline: "Precision engineering",
    models: [
      { id: "plamo-13b", name: "PLaMo 13B", competing: false },
      { id: "swallow-70b", name: "Swallow 70B", competing: false },
    ],
  },
  {
    country: "India",
    country_code: "IND",
    flag_emoji: "🇮🇳",
    tagline: "A billion parameters",
    models: [
      { id: "krutrim-pro", name: "Krutrim Pro", competing: false },
      { id: "airavata", name: "Airavata", competing: false },
    ],
  },
];

// ---- Event IDs (convenience) ----
export const EVENT_IDS = EVENTS.map((e) => e.id);
