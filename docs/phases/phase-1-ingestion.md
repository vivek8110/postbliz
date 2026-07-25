# Phase 1 — Ingestion and Knowledge

**~28h · Week 3 · Prerequisite:** Phase 0 gate passed (Task 1.0 excepted — run it any time)
**Read first:** [`content-system.md`](../product-information/content-system.md) ·
[`app-agents.md`](../product-information/app-agents.md) (agents 1 and 2)

## Goal

The grounding layer. **This is the product's actual differentiator** — every post downstream traces
back to what gets built here. Under-build this and no amount of prompt engineering downstream can
save you.

## Gate

- [ ] A real SaaS URL yields **25+ distinct, accurate facts**
- [ ] Median specificity ≥ 0.5
- [ ] Every fact shows its source URL and quote
- [ ] RSS feed added and polled; new items become knowledge items
- [ ] Brain dump text becomes knowledge items
- [ ] You look at the fact list and think *"yes, I'd post about these"*

**That last one is the real gate.** Everything else is measurable; this one is judgment. Trust it.

## Not in this phase

No post generation, no writing, no scheduling. Facts only.

---

## Task 1.0 — The spike ⚠️ GO/NO-GO · ~1h

**Do this first. Before Phase 0 finishes if you can.**

The entire product rests on one unverified assumption: *Firecrawl plus an LLM can extract 25+
specific, non-generic facts from a real SaaS URL.* If that produces mush, every phase after this is
wasted work.

One hour and about $3 to find out.

**Needs:** [Firecrawl](https://firecrawl.dev) key (500 free credits) and
[OpenRouter](https://openrouter.ai) key with $10 on it.

```
Read docs/product-information/content-system.md — Stage 2 only.

Write a throwaway spike.ts at the repo root. Not production code, will be
deleted. Run with tsx.

1. Take a URL from argv
2. Crawl with Firecrawl — homepage + up to 5 internal pages
3. Run the fact-extraction prompt from content-system.md against the result
4. Print each fact with its specificity score and source quote, sorted by
   specificity, plus total count and median

No DB, no framework, minimal error handling. Under 100 lines.
Confirm spike.ts is gitignored — this never gets committed.
```

Run it against **three** URLs: a friend's SaaS, a competitor (post-bridge.com works), and something
you know deeply.

### Reading the result

| You see | Means | Do |
|---|---|---|
| 25+ facts, median ≥ 0.5, specific | ✅ Premise holds | Build Phase 1 with confidence |
| Facts are accurate but generic | Prompt needs work | Iterate the prompt here, in the spike, where the loop is 30 seconds not 30 minutes |
| Under 15 facts on a real site | Crawl depth or extraction is wrong | Try more pages first, then revisit the prompt |
| Hallucinated facts | Grounding is broken | **Stop.** Fix before anything else — this violates Hard Rule 7 |

**If you can't get good facts out of three real sites after two hours of prompt iteration, that's
real signal about the product, not about your prompting.** Come back and we'll rethink the approach
before you spend six weeks on it.

---

## Task 1.1 — Crawl and brand profile · ~8h

```
Read docs/product-information/content-system.md (Stages 1-2),
app-agents.md (agents 1 and 2), and data-model.md (brand_profiles, sources).

Build the crawl pipeline. Port what worked from spike.ts, then delete
spike.ts.

1. lib/agents/brand-analyst.ts — Brand Analyst per app-agents.md.
   generateObject + Zod. Frontier tier — runs once, quality compounds
   through everything downstream.

2. trigger/ingest-crawl-site.ts — Firecrawl the homepage + up to 10
   internal pages, run Brand Analyst, write brand_profiles.

3. Stream progress with Trigger.dev Realtime. Per design.md the crawl is
   the emotional peak of onboarding — the user watches it work. Emit:
   pages found, pages processed, facts extracted.

4. Handle: unreachable URL, JS-only SPA, thin content (under ~500 words),
   crawl timeout. Each gets a plain-language message, never a stack trace.

5. Record token usage to usage_counters on every LLM call. No exceptions —
   this is how you see a cost runaway before the bill does.

Do NOT build fact extraction yet. Then stop.
```

**Verify:** crawl three real URLs. Profile is accurate and under 45s. Point it at a broken URL and
confirm the message is human-readable.

---

## Task 1.2 — Fact extraction · ~8h

```
Read docs/product-information/content-system.md (Stage 2) and
app-agents.md (agent 2).

Build the Fact Extractor.

1. lib/agents/fact-extractor.ts — the prompt from content-system.md,
   verbatim unless the spike taught you better. Cheap tier, batched:
   one call for 10 pages, not 10 calls.

2. Discard anything scoring specificity below 0.3. Marketing adjectives
   are not facts.

3. Embed each fact, store in knowledge_items.embedding.

4. Dedupe on insert — cosine > 0.9 against existing facts for that
   project means skip.

5. If median specificity across a project is below 0.5, flag the project
   as thin_content. Onboarding will use this to prompt for a brain dump
   instead of shipping the user mediocre output.

6. Wire into trigger/ingest-crawl-site.ts after Brand Analyst.

Then stop.
```

**Verify:** a real SaaS URL gives 25+ facts. Read them. Would you post about them? Deliberately try a
thin landing page and confirm the flag fires.

---

## Task 1.3 — Ongoing sources · ~6h

**Do not defer this.** A site crawl yields ~30 facts; at 15 posts/week you exhaust it in 2–3 weeks,
after which the model paraphrases itself. This task *is* the retention mechanic — see
[`decisions.md`](../product-information/decisions.md) D7.

```
Read docs/product-information/content-system.md (Stage 1) and
data-model.md (sources).

Build ongoing sources.

1. RSS/Atom: user adds a feed URL, validated on save. Store in sources.

2. trigger/ingest-poll-rss.ts — daily, per active source. Only items newer
   than lastCursor. Run Fact Extractor on new content. Update the cursor.

3. Brain dump: a textarea available from the knowledge screen, extracted
   through the same Fact Extractor.

4. Friday email via Resend: "What did you ship this week?" One textarea,
   and make reply-to-email work — inbound replies parse into a brain dump.

5. Mark new facts as unused so the Ideator prioritises them in Phase 2.

Then stop.
```

**Verify:** add a real changelog feed, run the poll, confirm new facts appear. Send yourself the
Friday email and reply to it.

---

## Task 1.4 — Knowledge browser · ~6h

The user must be able to see and correct everything we believe about their product. This is a trust
feature — they're technical and they will check.

```
Read docs/product-information/design.md (knowledge item component)
and features.md (F1, F2).

Build the knowledge screen.

- List all facts: text, source favicon + domain, specificity as a
  5-segment mono bar, category chip
- Hover reveals the source quote in a paper-sunken well
- Search, filter by source, filter by category, sort by specificity
- Edit or delete any fact
- Sources panel: type, last polled, item count, add/remove
- Brand profile section, every field editable
- Empty state per design.md copy rules — an invitation, not "no data"

Then stop. Phase 1 is complete after this.
```

**Verify:** edit a fact, delete a fact, add an RSS source, all from the UI.

---

## Troubleshooting

**Firecrawl returns nothing on a real site** — try `waitFor` for JS-heavy pages. Some sites block
crawlers; check `robots.txt` and fall back to manual paste.

**Facts are accurate but generic** — the source is marketing copy, not the extractor's fault. This is
exactly what `thin_content` exists to catch. Prompt for a brain dump.

**Extraction is slow** — batch. One call for 10 pages, not 10 calls. If it's still slow you're
probably on a frontier model for a cheap-tier task.

**Vector similarity errors** — confirm the `vector` extension is enabled and your embedding
dimensions match the column (1536).

**Costs higher than expected** — check you're not running the frontier model on extraction. Query
`usage_counters` to see where tokens actually went.

---

## Gate passed?

Tick the boxes. Then → **[Phase 2](phase-2-generation.md)**.

**Before you move on:** if the facts are mediocre, do not proceed. Everything downstream inherits
this quality. An extra day here is cheaper than four weeks of rework.
