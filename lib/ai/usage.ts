import { sql } from "drizzle-orm";
import { db } from "../../db";
import { usageCounters } from "../../db/schema";

// COGS tracking — record token spend on EVERY LLM call, no exceptions. You need
// to see a runaway before the bill does. Upserts the current-month row.
export async function recordUsage(
  userId: string,
  projectId: string | null,
  usage: { inputTokens?: number; outputTokens?: number } | undefined,
) {
  const inTok = usage?.inputTokens ?? 0;
  const outTok = usage?.outputTokens ?? 0;
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  await db
    .insert(usageCounters)
    .values({ userId, projectId, periodStart, llmInputTokens: inTok, llmOutputTokens: outTok })
    .onConflictDoUpdate({
      target: [usageCounters.userId, usageCounters.periodStart],
      set: {
        llmInputTokens: sql`${usageCounters.llmInputTokens} + ${inTok}`,
        llmOutputTokens: sql`${usageCounters.llmOutputTokens} + ${outTok}`,
      },
    });
}
