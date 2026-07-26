import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// One provider in front of many models; route by task tier (content-system.md
// cost table). All model IDs are env-overridable so we can tune without a deploy.
export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const MODELS = {
  cheap: process.env.MODEL_CHEAP ?? "google/gemini-2.5-flash", // extraction, high volume
  mid: process.env.MODEL_MID ?? "google/gemini-2.5-flash", // ideas, slop review
  frontier: process.env.MODEL_FRONTIER ?? "google/gemini-2.5-pro", // brand analysis, drafting — don't economise
  embedding: process.env.MODEL_EMBEDDING ?? "openai/text-embedding-3-small", // 1536 dims, matches the vector column
} as const;

export type Tier = keyof typeof MODELS;

export function model(tier: Tier) {
  return openrouter(MODELS[tier]);
}
