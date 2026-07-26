import { embedMany } from "ai";
import { openrouter, MODELS } from "./models";
import { recordUsage } from "./usage";

// openai/text-embedding-3-small via OpenRouter = 1536 dims, matching the
// knowledge_items.embedding vector column. Records token spend like any LLM call.
export async function embedFacts(
  userId: string,
  projectId: string,
  texts: string[],
): Promise<number[][]> {
  if (texts.length === 0) return [];
  const { embeddings, usage } = await embedMany({
    model: openrouter.textEmbeddingModel(MODELS.embedding),
    values: texts,
  });
  await recordUsage(userId, projectId, { inputTokens: usage?.tokens ?? 0 });
  return embeddings;
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}
