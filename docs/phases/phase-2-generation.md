# Phase 2 — Generation and Review

**~28h · Week 4 · Prerequisite:** Phase 1 gate passed
**Read first:** [`content-system.md`](../product-information/content-system.md) (Stages 3–6) ·
[`app-agents.md`](../product-information/app-agents.md) (agents 3, 5, 6, 7)

## Goal

Facts become posts that sound like the founder wrote them. This is where the wedge becomes real —
*explain, don't advertise*.

## Gate

- [ ] Generate 10 posts for your own product; **you'd publish 7 unedited**
- [ ] No post contains a fact absent from its knowledge items
- [ ] Ideas dedupe correctly — no near-repeats across 90 days
- [ ] Voice profile visibly changes output when swapped
- [ ] Thin knowledge base returns "insufficient material", never invented content
- [ ] Preview matches the real platform (fonts, limits, truncation)

## Not in this phase

No scheduling, no publishing, no OAuth. Generate and review only. Copy-paste to post manually if you
want to test in the wild.

---

## Task 2.1 — Voice profile · ~6h

The "memory file". Sampled once, cached, refreshed monthly — never per post. Per
[`decisions.md`](../product-information/decisions.md) D10.

```
Read docs/product-information/content-system.md (Stage 4, voice profile),
app-agents.md (agent 3), and data-model.md (voice_profiles).

Build the Voice Profiler.

1. lib/agents/voice-profiler.ts — takes 10-20 real posts, returns traits
   (sentence length, formality, emoji use, hashtags, capitalisation,
   signature phrases, things they never say) plus 10-20 few-shot examples.
   Mid tier.

2. Cache to voice_profiles. NEVER re-fetch per post.

3. trigger/refresh-voice-profiles.ts — monthly per project.

4. Sampling sources: LinkedIn and Reddit reads are free, sample by default.
   X reads cost money — gate to paid plans, label clearly in the UI.

5. Under 5 sample posts: fall back to brand tone markers and say so in
   the UI. Do not silently produce generic output.

6. Manual override — user can paste a plain-text description of how they
   want to sound, which takes precedence.

Channels aren't connected until Phase 3, so build a dev path that accepts
pasted sample posts. Then stop.
```

**Verify:** paste 15 of your own posts, read the extracted profile. Does it describe how you write?

---

## Task 2.2 — Ideation · ~6h

```
Read docs/product-information/content-system.md (Stage 3),
app-agents.md (agent 5), and data-model.md (ideas).

Build the Ideator.

1. lib/agents/ideator.ts — knowledge items + archetype quotas + last 90
   days of ideas → new ideas. Mid tier. Each idea records which
   knowledge items it came from (Hard Rule 6 provenance).

2. All eight archetypes from content-system.md. Enforce variety.

3. launch archetype capped at 1 per 2 weeks per project. Unchecked, the
   model defaults to launch posts because that's what marketing copy
   looks like — that's the failure state.

4. Dedupe: embed each idea, reject cosine > 0.85 against 90 days,
   regenerate. Also skip knowledge items with timesUsed > 3.

5. Prioritise recently-added facts — that's the point of ongoing sources.

6. Insufficient material → return insufficient_material. Never invent.

Then stop.
```

**Verify:** generate 20 ideas. Check the archetype spread, that none repeat, and that new facts
surface first.

---

## Task 2.3 — Writing · ~8h

**The most important task in the build.** This is the product.

```
Read docs/product-information/content-system.md (Stages 4-5) in full,
app-agents.md (agents 6 and 7), and platform-integrations.md
(cross-platform content rules).

Build the Writer and the Slop Critic.

1. lib/agents/writer.ts — FRONTIER tier. Do not economise here.
   Inputs: idea, its knowledge items, voice profile, platform rules,
   recent posts for tone continuity. One call per platform.

2. Separate prompts per platform in lib/agents/prompts/. Reddit's is
   materially different — value-first, independently conceived, not a
   reformat. See reddit-safety.md.

3. Every anti-slop rule from content-system.md goes in the system prompt.
   The banned-words list is not a suggestion.

4. Enforce "explain, don't advertise". If a draft could be a headline on
   a landing page, it's wrong.

5. Cannot introduce a fact absent from supplied knowledge items.
   Returns usedKnowledgeIds. Hard Rule 7.

6. lib/agents/slop-critic.ts — mid tier, scores 0-1 with per-rule
   violations. Score > 0.6 auto-regenerates once. Still high, flag to
   the user rather than publishing silently.

7. Log slopScore on every draft.

Then stop.
```

**Verify:** generate 10 posts for your own product. Read them as if someone else wrote them. Would
you publish them under your name? **That's the gate.**

---

## Task 2.4 — Review UI · ~8h

```
Read docs/product-information/design.md (post card, composer) and
features.md (F5).

Build the composer and review flow.

- Split: editor left, live platform-accurate preview right. Real fonts,
  real char limits, real truncation points per platform-integrations.md
- Inline editing, live character count in mono, over-limit blocks
  scheduling
- Approve / regenerate / discard on every draft
- Regenerate offers "different angle" vs "same angle, rewritten"
- Provenance sidebar: which facts produced this post, linked to the
  knowledge screen. Users are technical and will want to check
- Record editDistance (normalised Levenshtein, originalBody vs body) on
  every edit — this is the single best quality signal in the product
- Send edit distance to PostHog
- Undo after edit, before publish

Then stop. Phase 2 is complete after this.
```

**Verify:** edit a post, check `editDistance` is recorded. Confirm the X preview truncates at exactly
280.

---

## Troubleshooting

**Posts sound like AI despite the rules** — nine times out of ten the facts are too generic, not the
prompt. Check the specificity scores of the knowledge items feeding it. Fix upstream.

**Model ignores the banned-word list** — put it in the system prompt, not the user prompt, and state
it as a hard constraint rather than a preference. If it still leaks, the Slop Critic catches it —
that's what it's for.

**All posts feel same-y** — check archetype distribution. If everything is `shipped_this`, your
quota enforcement isn't working.

**Voice profile has no visible effect** — confirm the few-shot examples are actually in the prompt,
not just the trait summary. Examples do most of the work.

**Generation is expensive** — frontier tier belongs on drafting only. Extraction, ideation, and slop
review should all be cheaper models. Check `usage_counters`.

**"Insufficient material" fires constantly** — the knowledge base is genuinely thin. That's the
system working. Add sources.

---

## Gate passed?

Tick the boxes. Then → **[Phase 3](phase-3-publishing.md)**.

**Be honest about the 7-of-10 gate.** You will be tempted to grade generously because you built it.
If you'd only publish 4, the wedge doesn't exist yet — iterate the prompts before moving on. This is
the one gate where self-deception is most expensive.
