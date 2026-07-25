# MVP Scope

**Budget:** ~25–30 hrs/week, solo, alongside a full-time job. Roughly **250–300 hours** to first
paying customer. Every phase below is sized against that. If a phase slips two weeks, cut scope
inside it — do not extend the timeline.

**Definition of done:** a stranger enters a URL, connects X + LinkedIn + Reddit, and 14 days of posts
publish on schedule with no ban and no manual intervention — and they pay for month two.

> **This file is the overview. The work lives in [`docs/phases/`](../phases/README.md)** — one runbook
> per phase with paste-ready Claude Code prompts, testable gates, and troubleshooting. Start there.

---

## The scope line

| | In MVP | Deferred |
|---|---|---|
| **Publishing** | X, LinkedIn, Reddit, Instagram, TikTok | Everything else |
| **AI generation** | X, LinkedIn, Reddit (text) | IG/TikTok captions only, no media gen |
| **Media** | User uploads for IG/TikTok | Image generation, video generation, carousels |
| **Sources** | Site crawl + RSS + weekly brain dump | GitHub releases, YouTube, Notion |
| **Reddit** | All six safety checks + subreddit recommendation | Comment monitoring, shadowban detection |
| **Attribution** | Short links + click counts | Signup attribution, revenue attribution |
| **Analytics** | Clicks + publish status | Engagement metrics, performance learning loop |
| **Billing** | Dodo, 3 plans, hard caps | Annual, coupons, affiliate |
| **Agent** | — | MCP server (V1.1) |

**The reconciliation:** all five platforms *publish* at MVP because PostPeer gives us four almost
free. Only three get *AI generation*, because IG and TikTok need media and media is a different
product. This satisfies "all 5 platforms working" without paying for it in months.

---

## Phase 0 — Foundation (Week 1–2, ~50h)

Nothing user-facing. Get the skeleton right so nothing later is a rewrite.

- [ ] Next.js 15 App Router, TypeScript strict, Tailwind, shadcn/ui installed
- [ ] Neon project + Drizzle configured, migration flow working
- [ ] Full schema from [`data-model.md`](data-model.md) migrated — **all tables now**, even unused
- [ ] BetterAuth: email + Google, session handling, protected route middleware
- [ ] Trigger.dev v4 wired, one hello-world scheduled task deployed and firing
- [ ] Token encryption helper (`lib/crypto.ts`) — AES-GCM, key from env, used by every token write
- [ ] Sentry + PostHog installed, error boundary, first event firing
- [ ] App shell: sidebar, project switcher, empty states
- [ ] Public repo initialised, AGPL-3.0, `.env.example`, no secrets ever committed

**Done when:** you can sign up, create a project, and a scheduled Trigger task logs every minute.

---

## Phase 1 — Ingestion and knowledge (Week 3, ~28h)

The grounding layer. This is the product's actual differentiator — do not rush it.

- [ ] Firecrawl integration: crawl a URL, get markdown for homepage + up to 10 internal pages
- [ ] **Brand profile extraction** — one LLM call → structured JSON: what it does, who for, problem
      solved, tone markers, vocabulary, competitors named, pricing signals
- [ ] **Knowledge extraction** — decompose the crawl into discrete `knowledge_items`, each with
      source URL, confidence, and category (feature / benefit / origin story / technical detail /
      pricing / social proof)
- [ ] RSS source: user adds a changelog/blog feed, poll daily, extract new items
- [ ] Brain-dump input: freeform textarea → extracted into knowledge items
- [ ] Knowledge browser UI — user sees every fact we hold and can delete or correct any of them

**Done when:** you paste a real SaaS URL and get 25+ accurate, specific, non-overlapping facts you'd
be happy to see in a post.

> This is the phase most likely to be under-built. If the facts are generic, every post downstream is
> generic and the product fails. Spend the extra day here.

---

## Phase 2 — Generation and review (Week 4, ~28h)

- [ ] Voice profile: fetch user's last ~20 LinkedIn posts (free) and optionally X posts, distil to a
      cached `voice_profile` record — **fetch once, cache, refresh monthly.** Never re-fetch per post
- [ ] Ideation: knowledge items + archetypes → post ideas, deduped against last 90 days by embedding
- [ ] Writing: idea + voice profile + platform rules → draft. Separate prompt per platform
- [ ] Anti-slop pass: the checklist in [`content-system.md`](content-system.md) run as a second call
- [ ] Post archetypes implemented: shipped-this, lesson-learned, hot-take, origin-story, how-it-works,
      comparison, question, launch
- [ ] Review UI: platform-accurate preview, inline edit, approve, regenerate, discard
- [ ] Edit-distance tracking — log how much users change. Your single best quality metric

**Done when:** you generate 10 posts for your own product and would publish 7 of them unedited.

---

## Phase 3 — Scheduling and publishing (Week 5–6, ~56h)

- [ ] PostPeer account, API key, sandbox publish working
- [ ] OAuth connect flow for X, LinkedIn, Instagram, TikTok via PostPeer
- [ ] `channels` CRUD, connection health display, disconnect
- [ ] Cadence config per channel: days, times, timezone (IIANA, user's zone)
- [ ] Queue generation: fill 14 days forward from approved drafts
- [ ] **Publish job** in Trigger.dev — the critical path:
  - idempotency key check → state transition → token refresh if needed → platform call →
    record result → retry with backoff on transient, hold on permanent
- [ ] **X link handling: strip URLs from body, publish body, then publish link as first reply.**
      Enforced in code. See [`platform-integrations.md`](platform-integrations.md)
- [ ] ±7 min jitter on all scheduled times
- [ ] Failure handling: held state, plain-language reason, retry button
- [ ] Queue UI — the main screen. See the rail concept in [`design.md`](design.md)
- [ ] IG/TikTok thin slice: upload media to R2, AI writes caption, publish

**Done when:** 14 days of posts publish to real X and LinkedIn accounts unattended, and killing the
job mid-flight doesn't double-post.

---

## Phase 4 — Reddit (Week 7–8, ~56h)

Built direct, not through PostPeer. This is the moat — see [`reddit-safety.md`](reddit-safety.md).

- [ ] Reddit OAuth app registered, `identity submit read` scopes, direct integration
- [ ] Subreddit metadata fetch + cache: rules, karma requirements, posting frequency, flair
- [ ] **All six safety checks**, every publish, no exceptions:
      rules fetch · karma minimum · account age · per-sub cooldown · self-promo ratio · duplicate block
- [ ] Subreddit recommendation: from brand profile → suggest 5–10 relevant subs with rule summaries
- [ ] Reddit-native generation — **independently conceived, never a reformatted X post.**
      Title + body, no marketing voice, value-first
- [ ] Self-promo ratio tracker, visible in UI as a running count
- [ ] Held-post UX: explain exactly which rule blocked it and what to change

**Done when:** you post to 5 real subreddits over 2 weeks, nothing is removed, and the ratio tracker
correctly refuses an 11th promo post after 10.

---

## Phase 5 — Money and proof (Week 9, ~28h)

- [ ] Dodo Payments: 3 plans, checkout, webhook → subscription state, customer portal
- [ ] Plan limits enforced server-side: projects, channels, posts/month
- [ ] Trial: 10 posts total across all platforms, no card, hard stop with upgrade prompt
- [ ] Short-link service on own domain + click tracking → `link_clicks`
- [ ] Weekly digest email (Resend): what published, what's queued, clicks, what needs review
- [ ] Re-auth nudge emails when a token is expiring or a channel is unhealthy
- [ ] Dashboard: posts published this week, clicks to your site, what needs review. Nothing else

**Done when:** you can pay yourself with a real card and the limits actually bite.

---

## Phase 6 — Launch (Week 10, ~28h)

- [ ] Landing page. See [`GTM.md`](GTM.md) for the message
- [ ] Onboarding polish — this is the highest-leverage UI in the product
- [ ] Legal: ToS (including the account-ban clause), privacy policy
- [ ] Docs: self-host guide, since the repo is public
- [ ] Dogfood for 2 full weeks before launch. Postbliz posts about Postbliz
- [ ] Product Hunt assets, launch tweet thread, Reddit posts written by the product itself

---

## V1.1 — after first 10 paying customers

Ordered by expected value, not by how fun they are.

1. **MCP server** — publish, schedule, list queue from Claude Code / Cursor. Your ICP lives there
2. **Shadowban detection** for Reddit
3. **GitHub releases** as a source — near-zero effort, high signal for dev tools
4. **AI subreddit recommendation v2** using a real subreddit index
5. **Engagement metrics** where free (LinkedIn, Reddit); X reads stay opt-in due to cost
6. Bluesky and Threads — cheap breadth, both supported by PostPeer

## V2 — after $2k MRR

Image generation (Satori templates first, not diffusion) · TikTok video templates · signup
attribution · performance-informed generation · multi-account per platform

---

## Explicitly not in V1 or V2

Team seats · white-label · unified inbox · DM automation · engagement pods · follower analytics ·
Facebook / Pinterest / YouTube / Google Business · mobile app · Zapier

## Related

- [`features.md`](features.md) — acceptance criteria per feature
- [`tech-architecture.md`](tech-architecture.md) — how to build it
- [`risk-register.md`](risk-register.md) — what derails this plan
