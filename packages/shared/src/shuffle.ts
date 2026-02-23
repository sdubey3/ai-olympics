/**
 * Deterministic seeded shuffle using Mulberry32 PRNG.
 * Same eventId always produces the same blind ordering,
 * so "Model A" maps to the same real model for every viewer.
 */

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Returns a shuffled copy of `items` using a deterministic seed derived from `eventId`.
 * The same eventId always yields the same permutation.
 */
export function deterministicShuffle<T>(items: T[], eventId: string): T[] {
  const rng = mulberry32(hashString(eventId));
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Given an event ID and model IDs, returns a mapping from blind index → model_id.
 * blind index 0 = "Model A", 1 = "Model B", etc.
 */
export function getBlindMapping(
  eventId: string,
  modelIds: string[]
): { blindIndex: number; modelId: string }[] {
  const shuffled = deterministicShuffle(modelIds, eventId);
  return shuffled.map((modelId, blindIndex) => ({ blindIndex, modelId }));
}

/**
 * Resolves a blind index to a real model ID for a given event.
 */
export function resolveBlindIndex(
  eventId: string,
  modelIds: string[],
  blindIndex: number
): string {
  const mapping = getBlindMapping(eventId, modelIds);
  return mapping[blindIndex].modelId;
}
