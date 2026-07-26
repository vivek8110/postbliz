import { generateObject } from "ai";
import { z } from "zod";
import { model } from "../ai/models";
import { recordUsage } from "../ai/usage";
import { BRAND_ANALYST_SYSTEM } from "./prompts/brand-analyst";

// Agent 1 — Brand Analyst. In: crawled page markdown. Out: brand profile.
// Frontier tier — runs once at onboarding, quality compounds downstream.
export const brandProfileSchema = z.object({
  whatItDoes: z.string(),
  whoItsFor: z.string(),
  problemSolved: z.string(),
  category: z.string().nullable(),
  competitors: z.array(z.string()),
  vocabulary: z.array(z.string()),
  avoidTerms: z.array(z.string()),
  toneMarkers: z.array(z.string()),
});

export type BrandProfileResult = z.infer<typeof brandProfileSchema>;

export async function runBrandAnalyst(input: {
  userId: string;
  projectId: string;
  pages: string[];
}): Promise<BrandProfileResult> {
  const material = input.pages.join("\n\n---\n\n").slice(0, 80000);

  const { object, usage } = await generateObject({
    model: model("frontier"),
    schema: brandProfileSchema,
    system: BRAND_ANALYST_SYSTEM,
    prompt: `Product website pages (markdown):\n\n${material}`,
  });

  await recordUsage(input.userId, input.projectId, usage);
  return object;
}
