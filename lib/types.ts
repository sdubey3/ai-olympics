// ---- Database row types ----

export interface ModelRow {
  id: string;
  name: string;
  country: string;
  country_code: string;
  flag_emoji: string;
  color: string;
}

export interface EventRow {
  id: string;
  name: string;
  icon: string;
  sport_description: string;
  prompts: EventPrompt[];
  scoring_type: ScoringType;
  scheduled_at: Date;
  voting_closes_at: Date;
  status: EventStatus;
}

export interface ResponseRow {
  id: string;
  event_id: string;
  model_id: string;
  round: number;
  content: string;
  generated_at: Date;
  generation_ms: number;
  auto_score: Record<string, number> | null;
}

export interface VoteRow {
  id: string;
  event_id: string;
  model_id: string;
  voter_fingerprint: string;
  scores: Record<string, number> | null;
  created_at: Date;
}

export interface MedalRow {
  event_id: string;
  model_id: string;
  medal: MedalType;
  final_score: number;
}

export interface LeaderboardRow {
  model_id: string;
  model_name: string;
  country_code: string;
  flag_emoji: string;
  color: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

// ---- Client-facing types ----

export interface BlindModel {
  index: number;
  label: string;
  content: string;
}

export interface RevealedModel {
  index: number;
  label: string;
  model_id: string;
  name: string;
  country: string;
  country_code: string;
  flag_emoji: string;
  color: string;
  content: string;
  votes: number;
  medal: MedalType | null;
}

// ---- Enums ----

export type EventStatus = "upcoming" | "generating" | "voting" | "closed";
export type ScoringType = "pick" | "slider" | "hybrid" | "auto_vote";
export type MedalType = "gold" | "silver" | "bronze";

// ---- Event config types ----

export interface EventPrompt {
  round: number;
  system?: string;
  user: string;
  max_tokens: number;
}

export interface EventConfig {
  id: string;
  name: string;
  icon: string;
  sport_description: string;
  prompts: EventPrompt[];
  scoring_type: ScoringType;
  scheduled_at: string;
  voting_duration_minutes: number;
}

export interface TeamConfig {
  country: string;
  country_code: string;
  flag_emoji: string;
  tagline: string;
  models: TeamModel[];
}

export interface TeamModel {
  id: string;
  name: string;
  competing: boolean;
}

// ---- API types ----

export interface SSEChunk {
  modelIndex: number;
  delta: string;
  done: boolean;
}

export interface VoteRequest {
  event_id: string;
  model_index: number;
  scores?: Record<string, number>;
}

export interface VoteResponse {
  success: boolean;
  reveal: RevealedModel[];
}

export interface ResultsResponse {
  event_id: string;
  status: EventStatus;
  models: RevealedModel[];
  total_votes: number;
}
