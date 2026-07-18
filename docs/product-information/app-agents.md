# Agents

Two separate things share this word. Keep them apart:

- **Part 1 — Runtime agents.** LLM-powered steps inside Postbliz that do work for the user.
- **Part 2 — Build agents.** Claude Code subagents that help *you* build Postbliz.
- **Part 3 — The MCP server.** Postbliz as a tool other people's agents can call. (V1.1)

---

# Part 1 — Runtime agents

Nine narrow agents, each with one job, a typed input and a typed output. Not one clever agent with a
long prompt — narrow agents are testable, cheap, debuggable, and don't drift.

Every agent lives in `lib/agents/{name}.ts`, uses `generateObject` with a Zod schema, and is called
from a Trigger.dev task. **No agent calls another agent directly** — the task orchestrates.

```
                  ┌──────────────────┐
   URL ──────────►│ 1 Brand Analyst  │──► brand_profile
                  └──────────────────┘
                  ┌──────────────────┐
   raw text ─────►│ 2 Fact Extractor │──► knowledge_items[]
                  └──────────────────┘
                  ┌──────────────────┐
   past posts ───►│ 3 Voice Profiler │──► voice_profile   (monthly)
                  └──────────────────┘
                  ┌──────────────────┐
   brand ────────►│ 4 Sub Scout      │──► subreddit_targets[]
                  └──────────────────┘
                  ┌──────────────────┐
   knowledge ────►│ 5 Ideator        │──► ideas[]
                  └──────────────────┘
                  ┌──────────────────┐
   idea + voice ─►│ 6 Writer         │──► draft
                  └──────────────────┘
                  ┌──────────────────┐
   draft ────────►│ 7 Slop Critic    │──► score + violations
                  └──────────────────┘
                  ┌──────────────────┐
   draft + sub ──►│ 8 Rule Judge     │──► pass/fail + reason
                  └──────────────────┘
                  ┌──────────────────┐
   published ────►│ 9 Digest Writer  │──► weekly email  (V1.1)
                  └──────────────────┘
```

### 1 — Brand Analyst

**In:** Firecrawl markdown of homepage + up to 10 internal pages
**Out:** `brand_profile` — what it does, who for, problem solved, category, competitors, vocabulary,
terms to avoid, tone markers
**Tier:** frontier (runs once, quality compounds through everything downstream)
**Runs:** onboarding, then monthly refresh

Must distinguish what the product *does* from what the marketing *claims*. Extract the mechanism,
not the tagline.

### 2 — Fact Extractor

**In:** raw text from any source
**Out:** `knowledge_items[]` with fact, category, specificity, sourceQuote
**Tier:** cheap, batched (10 pages per call)
**Runs:** after any source ingest

Discards anything scoring specificity < 0.3. Marketing adjectives are not facts. Prompt in
[`content-system.md`](content-system.md).

### 3 — Voice Profiler

**In:** 10–20 of the user's real posts (LinkedIn/Reddit free; X paid-tier only)
**Out:** `voice_profile` — traits + few-shot examples
**Tier:** mid
**Runs:** onboarding, then **monthly**. Never per post

This is the "memory file": fetch once, cache, reuse. Re-fetching per post is slow and, on X,
genuinely expensive.

### 4 — Subreddit Scout

**In:** brand profile
**Out:** 5–10 candidate subs with rule summaries and a green/amber/red risk rating
**Tier:** mid
**Runs:** onboarding, then on request

Recommends. Never auto-adds a red sub. See [`reddit-safety.md`](reddit-safety.md).

### 5 — Ideator

**In:** unused/underused knowledge items, archetype quotas, last 90 days of ideas
**Out:** `ideas[]` — angle + archetype + source knowledge item IDs
**Tier:** mid
**Runs:** weekly per project, or on demand

Enforces archetype variety and the `launch` cap (1 per 2 weeks). Embeds and rejects anything >0.85
similar to a recent idea.

### 6 — Writer

**In:** idea, its knowledge items, voice profile, platform rules, recent posts for tone continuity
**Out:** `draft`
**Tier:** **frontier — this is the product, don't economise**
**Runs:** per draft

One call per platform. Reddit uses a materially different prompt. Anti-slop rules embedded. Cannot
introduce a fact absent from the supplied knowledge items — if material is thin it returns
`insufficient_material`, which surfaces to the user as a request for a brain dump.

### 7 — Slop Critic

**In:** draft
**Out:** `slopScore` 0–1 + per-rule violations
**Tier:** mid
**Runs:** after every draft

Score > 0.6 → auto-regenerate once. Still high → flag to the user rather than publish silently.
The score distribution over time is the quality dashboard.

### 8 — Rule Judge

**In:** draft + cached subreddit rules
**Out:** pass/fail + which rule + suggested fix
**Tier:** mid
**Runs:** check 1 of the Reddit safety gate

**Fails closed.** Uncertain → fail. The other five checks are deterministic code, not LLM calls —
only rule interpretation needs a model.

### 9 — Digest Writer (V1.1)

**In:** week's published posts, clicks, held posts
**Out:** short plain-language email
**Tier:** cheap

---

## Agent conventions

```ts
// lib/agents/writer.ts
export const writerOutput = z.object({
  body: z.string(),
  title: z.string().optional(),
  threadParts: z.array(z.string()).optional(),
  reasoning: z.string(),        // why this angle — shown in the UI on request
  usedKnowledgeIds: z.array(z.string()),   // provenance, enforces Rule 6
});

export async function runWriter(input: WriterInput) {
  const { object, usage } = await generateObject({
    model: openrouter(MODELS.frontier),
    schema: writerOutput,
    system: buildWriterSystem(input.platform, input.voiceProfile),
    prompt: buildWriterPrompt(input),
  });
  await recordUsage(input.projectId, usage);   // COGS tracking, always
  return object;
}
```

**Rules for all agents:**
- `generateObject` + Zod, always. Never free-text parsing
- Record token usage to `usage_counters` on every call, no exceptions
- Prompts live in `lib/agents/prompts/` as versioned exports, not inline strings
- Every agent is unit-testable with a fixture input — no network in tests
- Log inputs and outputs to PostHog (sampled) so you can debug bad output later
- Timeout and fall back gracefully. A failed agent holds a post; it never crashes a job

---

# Part 2 — Build agents (Claude Code)

Subagents to define in `.claude/agents/`. These help build Postbliz, not run it.

### `schema-guardian`
Owns `db/schema.ts` and migrations. Invoke for any DB change. Enforces: `user_id` on every
user-scoped table, timestamps, enums over text, indexes on foreign keys and query paths. Updates
[`data-model.md`](data-model.md) in the same commit — the doc and the schema never diverge.

### `platform-integrator`
Owns `lib/platforms/*`. Reads [`platform-integrations.md`](platform-integrations.md) first, every
time. Enforces the discriminated-union return type, transient/permanent classification, and **the X
link-stripping rule**. Never lets a raw platform error reach a user.

### `reddit-safety-auditor`
Reviews any diff touching Reddit. Verifies all six checks run, no bypass exists, results are written
to `safety_checks`, and failures produce plain-language user messages. Blocks the change otherwise.

### `prompt-engineer`
Owns `lib/agents/prompts/`. Reads [`content-system.md`](content-system.md) first. When changing a
prompt, generates 10 sample outputs against fixture inputs and diffs them against the previous
version. Prompt changes are product changes — treat them like code.

### `cost-auditor`
Invoke before merging anything that calls a paid API. Traces the call path, multiplies by 1,000
users, and reports monthly cost. Blocks anything that would exceed 30% COGS. Reads
[`pricing-and-unit-economics.md`](pricing-and-unit-economics.md).

### `ui-builder`
Owns components. Reads [`design.md`](design.md) first. Enforces the token system, the queue-rail
pattern, and the copy rules (active voice, no apologising errors, empty states as invitations).

### `docs-keeper`
After any meaningful change, updates the relevant doc and appends to
[`decisions.md`](decisions.md). Run at the end of a session, not during.

---

## Working agreement for Claude Code sessions

1. **Read [`mvp-scope.md`](mvp-scope.md) before starting.** Confirm the task is in the current phase.
   If it isn't, say so rather than building it.
2. **Read the relevant doc before writing code.** Platform work → platform-integrations. Reddit →
   reddit-safety. Prompts → content-system. Not optional.
3. **One phase at a time.** Don't build Phase 4 while Phase 2 is unfinished.
4. **Check the hard rules in [`CLAUDE.md`](../../CLAUDE.md)** before any commit.
5. **Append to [`decisions.md`](decisions.md)** when a call is made a future session would re-litigate.
6. **Ask before adding a dependency.** The stack is deliberately small.

---

# Part 3 — MCP server (V1.1)

Postbliz as a tool for *other people's* agents. Not a wedge — a distribution channel into where our
ICP already works.

**Tools to expose:**

| Tool | Does |
|---|---|
| `list_projects` | Projects and their channels |
| `add_knowledge` | Push a fact in — **the killer one.** `"add_knowledge: shipped batch export today"` from Claude Code after a deploy |
| `generate_post` | Draft for a platform, returns text without publishing |
| `schedule_post` | Queue a draft |
| `list_queue` | What's coming up |
| `check_reddit_safety` | Dry-run the six checks against a draft |

`add_knowledge` is why this matters. A developer finishes a feature in Claude Code and says *"add
that to Postbliz"* — the changelog problem solves itself, at the exact moment the fact is freshest.

Auth via workspace API key in the header. Ship as a hosted MCP endpoint plus a `skills` package so it
drops into Claude Code, Cursor, and Codex.

## Related

- [`content-system.md`](content-system.md) — what agents 2, 5, 6, 7 implement
- [`reddit-safety.md`](reddit-safety.md) — agent 8 and the deterministic checks
- [`mvp-scope.md`](mvp-scope.md) — build order
