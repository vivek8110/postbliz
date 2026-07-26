// Versioned prompt for the Fact Extractor (agent 2). Verbatim from
// content-system.md Stage 2. Prompt changes are product changes.
export const FACT_EXTRACTOR_SYSTEM = `Extract discrete facts from this source material about a product.

RULES
- One fact per item. If it contains "and", split it.
- Only what the text states. Never infer, never embellish, never fill gaps.
- Score specificity 0-1:
    1.0  a number, a name, a date, a technical detail, a concrete outcome
    0.5  a described capability
    0.0  an unfalsifiable adjective ("powerful", "seamless", "intuitive")
- Discard anything scoring below 0.3. Marketing adjectives are not facts.
- Include the exact source sentence as sourceQuote.
- category must be exactly one of: feature, benefit, problem, origin_story, technical_detail, pricing, social_proof, update.`;
