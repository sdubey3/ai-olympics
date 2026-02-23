import {
  pgTable,
  text,
  timestamp,
  jsonb,
  integer,
  uuid,
  unique,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const models = pgTable("models", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  country_code: text("country_code").notNull(),
  flag_emoji: text("flag_emoji").notNull(),
  color: text("color").notNull(),
});

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  sport_description: text("sport_description").notNull(),
  prompts: jsonb("prompts").notNull().$type<
    { round: number; system?: string; user: string; max_tokens: number }[]
  >(),
  scoring_type: text("scoring_type").notNull().$type<
    "pick" | "slider" | "hybrid" | "auto_vote"
  >(),
  scheduled_at: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  voting_closes_at: timestamp("voting_closes_at", {
    withTimezone: true,
  }).notNull(),
  status: text("status").notNull().default("upcoming").$type<
    "upcoming" | "generating" | "voting" | "closed"
  >(),
});

export const responses = pgTable("responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  event_id: text("event_id")
    .notNull()
    .references(() => events.id),
  model_id: text("model_id")
    .notNull()
    .references(() => models.id),
  round: integer("round").notNull().default(1),
  content: text("content").notNull(),
  generated_at: timestamp("generated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  generation_ms: integer("generation_ms").notNull().default(0),
  auto_score: jsonb("auto_score").$type<Record<string, number> | null>(),
});

export const votes = pgTable(
  "votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    event_id: text("event_id")
      .notNull()
      .references(() => events.id),
    model_id: text("model_id")
      .notNull()
      .references(() => models.id),
    voter_fingerprint: text("voter_fingerprint").notNull(),
    scores: jsonb("scores").$type<Record<string, number> | null>(),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("votes_event_voter_unique").on(
      table.event_id,
      table.voter_fingerprint
    ),
  ]
);

export const medals = pgTable(
  "medals",
  {
    event_id: text("event_id")
      .notNull()
      .references(() => events.id),
    model_id: text("model_id")
      .notNull()
      .references(() => models.id),
    medal: text("medal").notNull().$type<"gold" | "silver" | "bronze">(),
    final_score: integer("final_score").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.event_id, table.model_id] })]
);

// Relations
export const modelsRelations = relations(models, ({ many }) => ({
  responses: many(responses),
  votes: many(votes),
  medals: many(medals),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  responses: many(responses),
  votes: many(votes),
  medals: many(medals),
}));

export const responsesRelations = relations(responses, ({ one }) => ({
  event: one(events, {
    fields: [responses.event_id],
    references: [events.id],
  }),
  model: one(models, {
    fields: [responses.model_id],
    references: [models.id],
  }),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  event: one(events, {
    fields: [votes.event_id],
    references: [events.id],
  }),
  model: one(models, {
    fields: [votes.model_id],
    references: [models.id],
  }),
}));

export const medalsRelations = relations(medals, ({ one }) => ({
  event: one(events, {
    fields: [medals.event_id],
    references: [events.id],
  }),
  model: one(models, {
    fields: [medals.model_id],
    references: [models.id],
  }),
}));
