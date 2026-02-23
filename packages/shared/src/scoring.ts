import type { MedalType } from "./types";

/**
 * Count syllables in a word (rough heuristic).
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 2) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const vowelGroups = word.match(/[aeiouy]{1,2}/g);
  return vowelGroups ? vowelGroups.length : 1;
}

/**
 * Auto-score haiku for Big Air: verify 5-7-5 syllable structure.
 * Returns { valid: boolean, lines: number[], syllables: number[] }
 */
export function autoScoreSyllables(content: string): {
  valid: boolean;
  lines: number;
  syllables: number[];
} {
  const lines = content
    .trim()
    .split("\n")
    .filter((l) => l.trim().length > 0);
  const syllables = lines.map((line) =>
    line
      .trim()
      .split(/\s+/)
      .reduce((sum, word) => sum + countSyllables(word), 0)
  );
  const valid =
    lines.length === 3 &&
    syllables[0] === 5 &&
    syllables[1] === 7 &&
    syllables[2] === 5;
  return { valid, lines: lines.length, syllables };
}

/**
 * Auto-score for Slalom: check 8 gates (specific requirements).
 */
export function autoScoreGates(content: string): {
  passed: number;
  total: number;
  gates: Record<string, boolean>;
} {
  const lower = content.toLowerCase();
  const gates: Record<string, boolean> = {
    opens_with_dialogue: /^["'"']/.test(content.trim()) || /^["']/.test(content.trim()),
    mentions_temperature: /\b(cold|freeze|frost|ice|snow|chill|degree|temperature|warm|hot)\b/i.test(content),
    uses_fracture: /\bfracture\b/i.test(content),
    contains_question: /\?/.test(content),
    has_color: /\b(red|blue|green|yellow|gold|silver|white|black|purple|orange|crimson|scarlet|azure|emerald)\b/i.test(content),
    under_300_words: content.trim().split(/\s+/).length <= 300,
    has_twist: /\b(but|however|yet|suddenly|instead|actually|reveal|twist|realize|realiz)\b/i.test(lower),
    ends_single_sentence: (() => {
      const lines = content.trim().split("\n");
      const lastLine = lines[lines.length - 1].trim();
      const sentences = lastLine.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      return sentences.length <= 1;
    })(),
  };
  const passed = Object.values(gates).filter(Boolean).length;
  return { passed, total: 8, gates };
}

/**
 * Auto-score for Biathlon: heuristic code validation.
 */
export function autoScoreCode(content: string): {
  has_function: boolean;
  has_logic: boolean;
  has_output: boolean;
  score: number;
} {
  const has_function =
    /\b(function|def|fn|func|const\s+\w+\s*=\s*\(|class)\b/.test(content);
  const has_logic =
    /\b(if|else|for|while|switch|match|return|loop)\b/.test(content);
  const has_output =
    /\b(print|console\.log|puts|echo|printf|fmt\.Print|println)\b/.test(content);

  let score = 0;
  if (has_function) score += 1;
  if (has_logic) score += 1;
  if (has_output) score += 1;

  return { has_function, has_logic, has_output, score };
}

/**
 * Compute medals from model scores.
 * Returns top 3 with gold/silver/bronze assignments.
 */
export function computeMedals(
  modelScores: { modelId: string; score: number }[]
): { modelId: string; medal: MedalType; score: number }[] {
  const sorted = [...modelScores].sort((a, b) => b.score - a.score);
  const medals: MedalType[] = ["gold", "silver", "bronze"];
  return sorted.slice(0, 3).map((entry, i) => ({
    modelId: entry.modelId,
    medal: medals[i],
    score: entry.score,
  }));
}
