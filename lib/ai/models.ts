import { createOpenAI } from "@ai-sdk/openai";

/**
 * Create an OpenRouter-backed AI provider.
 * Uses the AI SDK's OpenAI-compatible interface pointed at OpenRouter.
 */
export function createOpenRouterProvider(apiKey: string) {
  return createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });
}

/**
 * Model ID mapping: our internal IDs → OpenRouter model IDs.
 * Season-specific apps provide their own mapping.
 */
export type ModelMapping = Record<string, string>;

/**
 * Create AI model instances from a model mapping.
 */
export function createModels(apiKey: string, mapping: ModelMapping) {
  const provider = createOpenRouterProvider(apiKey);
  const models: Record<string, ReturnType<typeof provider>> = {};
  for (const [internalId, openRouterId] of Object.entries(mapping)) {
    models[internalId] = provider(openRouterId);
  }
  return models;
}
