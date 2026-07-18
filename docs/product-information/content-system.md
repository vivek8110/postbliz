# Content System

This is the product. Everything else is plumbing.

## The core thesis

Content reads as AI-generated when it is **unfalsifiable**. "Our tool helps teams collaborate more
efficiently" could describe ten thousand products. "Shipped batch export today — 40 videos in one
click. Took three weeks because the render queue kept OOMing" could only describe one.

The difference isn't prompting. It's **whether the model had a specific fact to work with.**

You cannot prompt your way to specificity you don't have. So the whole architecture exists to
supply facts, one at a time, with provenance.

> **Rule 6: no post exists without a `knowledge_item`.** If the pipeline has no material, it returns
> "insufficient material" and asks the user for input. It does **not** produce a plausible sentence.

---

## Pipeline

```
SOURCES ──────► KNOWLEDGE ──────► IDEAS ──────► DRAFTS ──────► REVIEW
site crawl      discrete facts    angle +       platform-      slop check
rss/changelog   with provenance   archetype     native text    + user edit
brain dump      + specificity     + dedupe      + voice
```

Each arrow is a separate LLM call with a separate prompt. Do not collapse them — a single
mega-prompt produces exactly the mush we're trying to avoid.

---

## Stage 1 — Sources

| Source | Cadence | Yield | Why it matters |
|---|---|---|---|
| Site crawl | Once + monthly refresh | 25–40 facts | Foundation. Runs dry fast |
| **RSS / changelog** | Daily poll | 2–10/week | **The retention mechanic** |
| **Brain dump** | Weekly prompt | 3–8/week | The most human material you'll get |
| GitHub releases (V1.1) | On release | 1–5/week | Near-free for dev tools |

### The exhaustion problem

A site crawl yields maybe 30 genuinely distinct facts. At 5 posts/week × 3 platforms you consume all
of it in **two to three weeks**. After that the model paraphrases its own output, which is precisely
the failure mode that gets accounts flagged.

Ongoing sources are not a nice-to-have. They are the difference between a product people cancel in
month two and one they keep.

There's a business argument too: if the product only needs a URL once, it's a one-time tool. If it
needs your changelog every week, it's a subscription with a reason to exist.

### The Friday email

Every Friday, Resend sends: *"What did you ship this week?"* — one textarea, reply-to-email works
too. This is the single highest-value input in the system and it costs almost nothing to build.
Treat its response rate as a core product metric.

---

## Stage 2 — Knowledge extraction

Decompose raw source text into discrete, checkable facts.

**Each `knowledge_item` must be:**
- **Discrete** — one fact, not a paragraph
- **Checkable** — traceable to a source quote the user can verify
- **Scored** — `specificity` 0–1, self-assessed by the model
- **Categorised** — feature / benefit / problem / origin_story / technical_detail / pricing /
  social_proof / update

```
Extract discrete facts from this source material about a product.

RULES
- One fact per item. If it contains "and", split it.
- Only what the text states. Never infer, never embellish, never fill gaps.
- Score specificity 0–1:
    1.0  a number, a name, a date, a technical detail, a concrete outcome
    0.5  a described capability
    0.0  an unfalsifiable adjective ("powerful", "seamless", "intuitive")
- Discard anything scoring below 0.3. Marketing adjectives are not facts.
- Include the exact source sentence as `sourceQuote`.

Return: { facts: [{ fact, category, specificity, sourceQuote }] }
```

**Watch the specificity distribution.** If a project's median is below 0.5, its landing page is pure
marketing copy and every downstream post will be weak. Detect this and prompt the user for a brain
dump during onboarding rather than shipping them mediocre output.

---

## Stage 3 — Ideas

An idea = one or two knowledge items + an archetype + an angle. Written *before* any prose exists,
which keeps the model from drifting into generic phrasing.

### Archetypes

Eight, fixed. Constrained beats infinite — a fixed set is testable, tunable, and gives variety
without randomness.

| Archetype | Shape | Best for | Platforms |
|---|---|---|---|
| `shipped_this` | Built X. Here's why it was harder than expected | update facts | X, LinkedIn, Reddit |
| `lesson_learned` | Got this wrong. Here's what I'd do differently | origin_story | LinkedIn, Reddit, X |
| `hot_take` | Common belief is wrong, here's why | problem | X, LinkedIn |
| `origin_story` | Why this exists at all | origin_story | LinkedIn, Reddit |
| `how_it_works` | The mechanism, explained plainly | technical_detail | X, Reddit, LinkedIn |
| `comparison` | Two approaches, honest tradeoffs | feature, competitors | Reddit, LinkedIn |
| `question` | Genuine question to the audience | problem | X, Reddit |
| `launch` | This is live now | feature | all, **rate-limited** |

`launch` is capped at **one per two weeks per project.** Left unchecked the model defaults to launch
posts, because launch posts are what marketing copy looks like. That is the failure state.

### Dedupe

Before an idea is accepted, embed it and compare against every idea from the last 90 days. Cosine
similarity above **0.85** → reject and regenerate. Also check against knowledge items already used
more than 3 times.

This is the mechanism that stops "our tool saves you time" appearing every third post.

---

## Stage 4 — Drafting

One call per platform. Inputs: idea, knowledge items, voice profile, platform rules, recent posts
(for tone continuity).

### The voice profile

Sampled once from the user's real posts, cached in `voice_profiles`, refreshed monthly. **Never
re-fetch per post** — that's both slow and, on X, expensive.

LinkedIn and Reddit reads are free, so sample those by default. X reads cost money, so make X
sampling a paid-tier feature.

Stores: sentence length, formality, emoji use, hashtag use, capitalisation habits, signature phrases,
things they never say, and 10–20 few-shot examples of their actual posts.

### The anti-slop rules

These go in every drafting prompt. They are derived from what actually makes text read as machine-
written, not from a style preference.

```
NEVER
- Open with "In today's fast-paced world" or any variant
- Use: leverage, utilise, robust, seamless, game-changer, revolutionise,
  unlock, empower, elevate, delve, tapestry, testament, landscape
- Write "It's not just X, it's Y"
- Write a rhetorical question followed immediately by its answer
- End with a generic CTA ("What do you think? Let me know below!")
- Use em-dashes more than once
- Produce a tidy tricolon of three parallel adjectives
- Include a fact not present in the supplied knowledge items
- Sound like a press release

ALWAYS
- Lead with the most specific detail available
- Include at least one concrete number, name, or technical noun
- Keep one rough edge — a real product has friction, say so
- Write in the founder's voice, first person, as if to one person
- Explain the thing. Do not sell the thing.
```

### Explain, don't advertise

The one rule that defines this product.

| Advertising ❌ | Explaining ✅ |
|---|---|
| "Postbliz makes social media effortless" | "The hard part wasn't scheduling, it was figuring out what to post" |
| "Try our AI-powered generator today!" | "It reads your changelog and turns each entry into a post. That's the whole trick" |
| "Join thousands of happy founders" | "12 people are using it. Two told me the Reddit checks saved them a ban" |

If a draft could be a headline on a landing page, it's wrong.

---

## Stage 5 — Slop review

A second, cheaper call scores each draft 0–1 against the rules above and returns per-rule violations.

- `slopScore > 0.6` → regenerate once, automatically
- Still high → surface to the user flagged, don't silently publish
- Log the score on every draft — the distribution over time is your quality dashboard

This deliberately costs an extra call per post. It's worth it: one cringe post published on a
founder's real account loses that customer permanently and they will say why, publicly.

---

## Stage 6 — Human review

Per the hybrid model: generate → user reviews → publish. If autopilot is on and the user hasn't
reviewed by fire time, publish anyway (they opted in). If autopilot is **off**, hold and nudge — do
not publish on their behalf.

**Track `editDistance` on every post.** Normalised Levenshtein between the generated text and what
actually shipped.

| Median edit distance | Read |
|---|---|
| < 0.1 | Excellent. Generation is landing |
| 0.1–0.3 | Healthy. Normal polishing |
| 0.3–0.5 | Warning. Investigate prompts now |
| > 0.5 | They're rewriting everything. They will churn |

This is the most honest quality metric in the product because it's revealed preference, not a rating.
Watch it in PostHog weekly.

---

## Platform-specific notes

**X** — one idea only. No "thread of 10 tips". Lowercase openings are fine and often better. Link
always in the reply.

**LinkedIn** — hook in the first two lines (everything after is behind "see more"). Short paragraphs.
No hashtag spam; 0–3 maximum. Reflective register.

**Reddit** — **independently conceived, never reformatted.** Different prompt, different structure.
Value must stand alone if the product is removed from the post entirely. Product mentioned once, late,
or not at all. Title carries most of the weight. No marketing voice anywhere. See
[`reddit-safety.md`](reddit-safety.md).

**Instagram / TikTok** — caption supports user-supplied media. Never write a caption implying content
the media doesn't show. First line is the hook.

---

## Cost control

| Stage | Tier | Notes |
|---|---|---|
| Knowledge extraction | Cheap | Batch 10 pages per call |
| Embeddings | Embedding model | Cache, never recompute |
| Ideas | Mid | Short output |
| **Drafting** | **Frontier** | The product. Don't economise |
| Slop review | Mid | |

Everything uses `generateObject` with a Zod schema — cheaper, no parse failures, no repair loops.

## Related

- [`data-model.md`](data-model.md) — `knowledge_items`, `ideas`, `drafts`
- [`app-agents.md`](app-agents.md) — this pipeline as discrete agents
- [`reddit-safety.md`](reddit-safety.md) — Reddit's separate path
