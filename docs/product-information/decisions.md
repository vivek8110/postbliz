# Decision Log

Append-only. When you make a call a future session would otherwise re-litigate, record it here.

**Format:** what was decided · what was rejected · **why** · what would change it.

The "why" is the expensive part to reconstruct. Six months from now you won't remember that X charges
13× for links, only that the code does something odd with replies.

---

## D1 — Explain, don't advertise

**Decided:** the product generates posts that explain what the founder built, not marketing copy.

**Rejected:** conventional AI marketing copy generation (Blaze, Marky, Apaya).

**Why:** founders are bad at advertising and good at explaining. Explanations need facts, which
forces the grounding architecture; they read as human, which avoids AI-slop detection; and they're
what Reddit permits, which unlocks the platform nobody else touches. One decision, three benefits.

**Would change if:** users consistently rewrite explanatory posts into promotional ones.

---

## D2 — PostPeer for four platforms, Reddit direct

**Decided:** rent X, LinkedIn, Instagram, TikTok from PostPeer. Build Reddit ourselves.

**Rejected:** post-bridge (no Reddit; API is a $5/mo add-on requiring a consumer subscription; and
it's a direct competitor) · Zernio (has Reddit but per-account pricing ≈ $518/mo at 100 customers vs
PostPeer's $120) · Ayrshare ($149/mo for one profile) · building all five natively (4–8 weeks of Meta
and TikTok approvals we don't have).

**Why:** buy the commodity, build the moat. PostPeer bills per credit with unlimited connected
accounts, which suits multi-tenant SaaS, and has already cleared Meta App Review and the TikTok audit.
Neither PostPeer nor post-bridge supports Reddit — which is fine, because Reddit is the part we want
to own.

**Would change if:** PostPeer raises prices >50%, has an outage >4h, or adds Reddit at good quality.
All calls are wrapped in `lib/platforms/postpeer.ts` so swapping is an adapter change.

---

## D3 — X links go in the first reply, never the body

**Decided:** strip URLs from X post bodies, publish the link as a threaded reply. Enforced in code.

**Why:** X charges $0.20 per post containing a URL vs $0.015 without — 13×. PostPeer passes it through
as 5 vs 50 credits. At 100 customers this is **$63/mo vs $630/mo**. Link-in-reply is also believed to
perform better since X deprioritises off-platform links. The cheap path is the good path.

**Would change if:** X removes the surcharge.

---

## D4 — All six Reddit safety checks, no bypass

**Decided:** subreddit rules · karma minimum · account age · per-sub cooldown · self-promo ratio ·
duplicate block. All six, every publish, no override flag anywhere in the codebase.

**Rejected:** shipping three now and three later.

**Why:** this is the moat. Half a moat is not a moat. A partial gate that lets someone get banned is
worse than no gate, because we claimed safety and didn't deliver. The reputational cost of one public
complaint exceeds the revenue from many subscriptions.

**Would change if:** a check proves to have a high false-positive rate — tune it, don't remove it.

---

## D5 — Per-project pricing with caps, not credits

**Decided:** plan tiers with project/channel/volume caps. Trial = 10 posts total, no card.

**Rejected:** credit-based pricing.

**Why:** credits make people ration posting. This product's value depends on consistency; a user who
posts less sees no results and churns. Never price against your own value metric. Our real cost
driver (X links) is solved in product design, not pricing, so caps can be generous.

**Would change if:** a small number of users generate outsized LLM cost despite caps.

---

## D6 — Fully open source, AGPL-3.0

**Decided:** everything public, including the Reddit safety engine and prompts. AGPL-3.0 + CLA.

**Rejected:** open core with the Reddit engine private · MCP/SDK only · closed.

**Why:** founder's call. Distribution through GitHub, trust from readable code handling OAuth tokens,
credibility with a developer ICP. Postiz validates the model at $1.3M ARR. AGPL prevents a funded
competitor forking into a closed SaaS. The CLA preserves relicensing options.

**Accepted cost:** the safety engine is copyable. Mitigation is that the checks are tedious rather
than secret — the real moat is the accumulated subreddit rules data (in our DB, not the repo), tuning
from real usage, and being *known* as the Reddit-safe tool.

**Would change if:** a competitor forks and materially damages the business. Note: irreversible.

---

## D7 — Ongoing sources are MVP scope, not V2

**Decided:** RSS/changelog ingestion and the weekly brain-dump email ship in the MVP.

**Rejected:** crawl-once, as competitors do.

**Why:** a site crawl yields ~30 distinct facts; at 15 posts/week that's exhausted in 2–3 weeks, after
which the model paraphrases itself — the exact failure that kills the product. Also the business
argument: a product that needs your URL once is a one-time tool; one that needs your changelog weekly
is a subscription.

---

## D8 — Cloudflare R2, not Neon, for media

**Decided:** R2 for object storage.

**Why:** Neon is Postgres only — it has no bucket. R2 has zero egress fees, which matters when TikTok
videos are moving.

---

## D9 — Publishing on all five, generation on three

**Decided:** X, LinkedIn, Reddit, Instagram, TikTok all publish at MVP. AI generation only for X,
LinkedIn, Reddit. IG/TikTok use user-uploaded media with AI captions.

**Why:** reconciles "all five platforms at launch" with a 10-week timeline. PostPeer gives us four
platforms nearly free, so publishing is cheap. Generation for IG/TikTok requires media generation,
which is a different product and months of work.

**Would change if:** users treat IG/TikTok as primary — currently unlikely for a B2B SaaS ICP.

---

## D10 — Voice profile cached, refreshed monthly

**Decided:** sample the user's posts once at onboarding, cache to `voice_profiles`, refresh monthly.
LinkedIn and Reddit free for all plans; X sampling paid-tier only.

**Rejected:** fetching recent posts per generation.

**Why:** per-post fetching is slow and, on X, genuinely expensive (reads are billed). Writing voice
changes over months, not hours. Founder's own framing: "a memory file."

---

## D11 — USD only

**Decided:** no INR pricing.

**Why:** founder's call after considering regional pricing. Simpler billing, one price to reason
about, and the ICP is global-English regardless of where the founder sits.

---

## D12 — Week 12 is a checkpoint, not a kill date

**Decided:** no kill criteria. A structured decision point at week 12 instead, with predetermined
readings for each outcome.

**Why:** founder declined a kill date. The compromise preserves the actual value — deciding *now*,
while unattached, what each outcome means — without forcing a commitment they don't want. See
[`risk-register.md`](risk-register.md).

---

## D13 — bun as package manager, Node as the runtime

**Decided:** bun for install and local scripts (`dev`, `build`, `bun test`). Node stays the deploy
runtime.

**Rejected:** pnpm (the phase doc's assumption) · npm (the scaffold default).

**Why:** fast installs and a built-in test runner — no extra dependency to unit-test `lib/crypto` and
the Sentry scrubber. Node remains the runtime because Trigger.dev executes tasks on its Node cloud and
Next builds on Node; the corollary is that schema files must not import from `"bun"` (drizzle-kit runs
under Node).

**Would change if:** a core tool can't run under bun on Windows. The `@better-auth` and `trigger.dev`
CLIs already hit native-build friction — see D18.

**Date:** 2026-07-25

---

## D14 — Geist, not Instrument Sans

**Decided:** Geist Sans (UI) + Geist Mono (data).

**Rejected:** Instrument Sans + JetBrains Mono (design.md's original pick) · Inter.

**Why:** Geist is Vercel's developer-tool superfamily — reads engineered, not marketed, which matches
the "proof sheet" ICP. It's already bundled in the Next scaffold via `next/font` (least plumbing), and
the sans and mono are designed together. Explicitly not Inter — the generic-SaaS default design.md set
out to avoid.

**Would change if:** the brand moves away from the developer-tool aesthetic.

**Date:** 2026-07-25

---

## D15 — `db/` at repo root, not `lib/db/`

**Decided:** the DB layer (schema, client, scoped helper, migrations) lives at repo-root `db/`.

**Rejected:** `lib/db/` (open-source.md's prescribed tree).

**Why:** CLAUDE.md conventions and data-model.md already assumed root `db/`; only open-source.md and
one Task 0.1 step disagreed. Fix the two outliers, not the three that were already right.

**Date:** 2026-07-25

---

## D16 — Native `uuidv7()` primary keys

**Decided:** every `id` defaults to Postgres 18's native `uuidv7()`.

**Rejected:** `gen_random_uuid()` (v4, not time-sortable) · app-side `$defaultFn` using the `uuid` npm
package.

**Why:** sortable v7 IDs with zero JS dependency, generated by the DB so raw-SQL and backfill inserts
are covered too. Verified live on Neon (PG18.4). Avoids a real trap: `drizzle-kit` runs under Node, so
`Bun.randomUUIDv7` in a schema file breaks generation.

**Would change if:** we target a pre-18 Postgres for local dev — fall back to the documented app-side
default.

**Date:** 2026-07-25

---

## D17 — One dark-mode mechanism: `prefers-color-scheme`

**Decided:** system-preference dark mode, mapped through `@theme inline`; omit shadcn's `.dark`-class
variant.

**Rejected:** running shadcn's default `.dark` class alongside design.md's `@media` block — two
competing mechanisms.

**Why:** design.md defines the dark tokens under `@media (prefers-color-scheme: dark)`. Adding a
`.dark` class too means an OS-dark user can't force light. `@theme inline` keeps the `var()`
indirection so utilities flip under the media query (plain `@theme` bakes the value).

**Would change if:** we add a manual light/dark toggle — then switch wholesale to the class strategy.

**Date:** 2026-07-25

---

## D18 — Hand-written BetterAuth schema

**Decided:** the BetterAuth core tables (`user`/`session`/`account`/`verification`) are hand-written in
`db/auth-schema.ts` and migrated with drizzle-kit.

**Rejected:** `@better-auth/cli generate` (the documented path).

**Why:** the CLI pulls in `better-sqlite3`, whose native build crashes bun on Windows (no build
tools). The core table shape is stable across BetterAuth 1.x, so hand-writing it and feeding it to
drizzle-kit is reliable and reproducible. The adapter still owns the tables at runtime.

**Would change if:** the CLI runs in the deploy/CI environment — regenerate to catch schema drift when
adding BetterAuth plugins.

**Date:** 2026-07-25

---

## D19 — Sentry init-only, no `withSentryConfig` (yet)

**Decided:** Sentry wired via instrumentation files plus a `beforeSend` secret scrubber only.

**Rejected:** the full wizard setup with source-map upload.

**Why:** init-only captures errors and applies the scrubber (the Phase 0 requirement) without risking
the Turbopack build or needing a `SENTRY_AUTH_TOKEN`. Source-map upload is a later, low-risk add.

**Would change if:** production stack traces are unreadable without source maps — add `withSentryConfig`
and the auth token then.

**Date:** 2026-07-25

---

## Template

```markdown
## D{n} — {decision}

**Decided:** {what}
**Rejected:** {alternatives}
**Why:** {reasoning — the expensive part}
**Would change if:** {what new information would reverse this}
**Date:** {when}
```
