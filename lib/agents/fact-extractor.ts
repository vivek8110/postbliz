import { generateObject } from "ai";
import { z } from "zod";
import { model } from "../ai/models";
import { recordUsage } from "../ai/usage";
import { FACT_EXTRACTOR_SYSTEM } from "./prompts/fact-extractor";

// Agent 2 — Fact Extractor. In: raw source markdown. Out: discrete facts.
// Cheap tier, batched (one call for all pages). Discards specificity < 0.3.
const categoryEnum = z.enum([
  "feature",
  "benefit",
  "problem",
  "origin_story",
  "technical_detail",
  "pricing",
  "social_proof",
  "update",
]);

export const factSchema = z.object({
  fact: z.string(),
  category: categoryEnum,
  specificity: z.number().min(0).max(1),
  sourceQuote: z.string(),
});
export type ExtractedFact = z.infer<typeof factSchema>;

const outputSchema = z.object({ facts: z.array(factSchema) });

export async function runFactExtractor(input: {
  userId: string;
  projectId: string;
  pages: string[];
}): Promise<ExtractedFact[]> {
  const material = input.pages.join("\n\n---\n\n").slice(0, 100000);

  const { object, usage } = await generateObject({
    model: model("cheap"),
    schema: outputSchema,
    system: FACT_EXTRACTOR_SYSTEM,
    prompt: `Source material (markdown):\n\n${material}`,
  });

  await recordUsage(input.userId, input.projectId, usage);
  // Marketing adjectives are not facts.
  return object.facts.filter((f) => f.specificity >= 0.3);
}
