/**
 * Seed script for Winter 2026 edition.
 * Run with: pnpm db:seed
 *
 * Requires DATABASE_URL environment variable.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { models, events } from "./schema";

// Inline the config to avoid import path issues in seed script
const MODEL_DATA = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    country: "United States",
    country_code: "USA",
    flag_emoji: "🇺🇸",
    color: "#10A37F",
  },
  {
    id: "claude-3.5-sonnet",
    name: "Claude 3.5",
    country: "United States",
    country_code: "USA",
    flag_emoji: "🇺🇸",
    color: "#D97706",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5",
    country: "United States",
    country_code: "USA",
    flag_emoji: "🇺🇸",
    color: "#4285F4",
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    country: "China",
    country_code: "CHN",
    flag_emoji: "🇨🇳",
    color: "#E53E3E",
  },
  {
    id: "mistral-large",
    name: "Mistral Large",
    country: "France",
    country_code: "FRA",
    flag_emoji: "🇫🇷",
    color: "#7C3AED",
  },
];

const EVENT_DATA = [
  {
    id: "big-air",
    name: "BIG AIR",
    icon: "🏂",
    sport_description:
      "Write a haiku about winter. Must follow 5-7-5 syllable structure.",
    prompts: [
      {
        round: 1,
        system:
          "You are a poet. Write ONLY a haiku (three lines: 5 syllables, 7 syllables, 5 syllables). No title, no explanation — just the haiku.",
        user: "Write a haiku about winter.",
        max_tokens: 100,
      },
    ],
    scoring_type: "hybrid" as const,
    scheduled_at: "2026-03-01T01:00:00Z",
    voting_closes_at: "2026-03-01T03:00:00Z",
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
          "You are a literary writer. Write a short, evocative piece (poem or prose, 2-6 sentences) about loneliness. No title.",
        user: "Write a short piece about loneliness.",
        max_tokens: 300,
      },
    ],
    scoring_type: "slider" as const,
    scheduled_at: "2026-03-01T19:00:00Z",
    voting_closes_at: "2026-03-01T21:00:00Z",
  },
  {
    id: "biathlon",
    name: "BIATHLON",
    icon: "🎯",
    sport_description:
      "Two disciplines: write a prime-check function, then write a haiku about coding.",
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
          "Write ONLY a haiku about coding. Three lines: 5, 7, 5 syllables. No title.",
        user: "Write a haiku about coding.",
        max_tokens: 100,
      },
    ],
    scoring_type: "hybrid" as const,
    scheduled_at: "2026-03-01T23:00:00Z",
    voting_closes_at: "2026-03-02T01:00:00Z",
  },
  {
    id: "slalom",
    name: "THE LUGE",
    icon: "🛷",
    sport_description:
      'Navigate 8 gates: open with dialogue, mention temperature, use "fracture", include a question, name a color, under 300 words, plot twist, end on single sentence.',
    prompts: [
      {
        round: 1,
        system:
          'Write a short story (under 300 words) satisfying ALL: 1) Opens with dialogue 2) Mentions temperature 3) Uses "fracture" 4) Includes a question 5) Names a color 6) Under 300 words 7) Plot twist 8) Ends on single sentence.',
        user: "Write a constrained short story following the 8 gate requirements.",
        max_tokens: 500,
      },
    ],
    scoring_type: "auto_vote" as const,
    scheduled_at: "2026-03-02T19:00:00Z",
    voting_closes_at: "2026-03-02T21:00:00Z",
  },
  {
    id: "speed-skating",
    name: "SPEED SKATING",
    icon: "🏃",
    sport_description:
      "Explain quantum computing to a 10-year-old in exactly 3 sentences.",
    prompts: [
      {
        round: 1,
        system:
          "Explain quantum computing to a 10-year-old in EXACTLY 3 sentences. Be clear, accurate, engaging.",
        user: "Explain quantum computing to a 10-year-old in 3 sentences.",
        max_tokens: 200,
      },
    ],
    scoring_type: "pick" as const,
    scheduled_at: "2026-03-02T23:00:00Z",
    voting_closes_at: "2026-03-03T01:00:00Z",
  },
  {
    id: "curling",
    name: "CURLING",
    icon: "🥌",
    sport_description:
      "Write a persuasive argument for why pineapple belongs on pizza. Wit and logic win.",
    prompts: [
      {
        round: 1,
        system:
          "Write a short, witty, persuasive argument (3-5 sentences) for why pineapple belongs on pizza. Be clever. No title.",
        user: "Argue why pineapple belongs on pizza.",
        max_tokens: 300,
      },
    ],
    scoring_type: "pick" as const,
    scheduled_at: "2026-03-03T01:00:00Z",
    voting_closes_at: "2026-03-03T03:00:00Z",
  },
];

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = neon(url);
  const db = drizzle(sql);

  console.log("Seeding models...");
  for (const model of MODEL_DATA) {
    await db
      .insert(models)
      .values(model)
      .onConflictDoUpdate({
        target: models.id,
        set: {
          name: model.name,
          country: model.country,
          country_code: model.country_code,
          flag_emoji: model.flag_emoji,
          color: model.color,
        },
      });
  }
  console.log(`  ✓ ${MODEL_DATA.length} models`);

  console.log("Seeding events...");
  for (const event of EVENT_DATA) {
    await db
      .insert(events)
      .values({
        id: event.id,
        name: event.name,
        icon: event.icon,
        sport_description: event.sport_description,
        prompts: event.prompts,
        scoring_type: event.scoring_type,
        scheduled_at: new Date(event.scheduled_at),
        voting_closes_at: new Date(event.voting_closes_at),
        status: "upcoming",
      })
      .onConflictDoUpdate({
        target: events.id,
        set: {
          name: event.name,
          icon: event.icon,
          sport_description: event.sport_description,
          prompts: event.prompts,
          scoring_type: event.scoring_type,
          scheduled_at: new Date(event.scheduled_at),
          voting_closes_at: new Date(event.voting_closes_at),
        },
      });
  }
  console.log(`  ✓ ${EVENT_DATA.length} events`);

  console.log("Seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
