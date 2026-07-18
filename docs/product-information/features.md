# Features

Each feature has acceptance criteria written as observable behaviour. If you can't test it, it isn't
specified. Phase numbers map to [`mvp-scope.md`](mvp-scope.md).

---

## F1 — Project onboarding · Phase 1

User enters a product URL; we understand the product.

**Behaviour:** paste URL → Firecrawl crawls homepage + up to 10 internal pages → Brand Analyst
produces a profile → Fact Extractor produces knowledge items → progress streams live via Trigger.dev
Realtime → user confirms/edits the profile.

**Acceptance**
- [ ] A real SaaS URL yields ≥ 25 distinct knowledge items
- [ ] Median specificity ≥ 0.5; if below, user is prompted for a brain dump
- [ ] Every field of the brand profile is editable
- [ ] Every knowledge item shows its source URL and quote
- [ ] Crawl completes in < 45s; failure gives a plain-language reason and a retry
- [ ] Invalid / unreachable / JS-only URL is caught and explained before the LLM is called

**Edge:** SPA with no server-rendered content · site behind auth · non-English site (out of scope,
say so) · a single-page landing with 3 sentences (prompt for brain dump immediately)

---

## F2 — Ongoing sources · Phase 1

The retention mechanic. See [`content-system.md`](content-system.md) for why this isn't optional.

**Acceptance**
- [ ] User can add an RSS/Atom feed URL; validated on save
- [ ] Daily poll extracts only items newer than `lastCursor`
- [ ] Brain dump textarea available any time from the composer and the knowledge screen
- [ ] Friday email asks "What did you ship this week?" — reply-to-email is ingested
- [ ] New knowledge items are visibly marked as new and prioritised by the Ideator
- [ ] User can delete or edit any extracted fact

---

## F3 — Voice profile · Phase 2

**Acceptance**
- [ ] Samples 10–20 posts from LinkedIn and Reddit (free reads) at connect time
- [ ] X sampling is gated to paid plans and clearly labelled as such
- [ ] Cached in `voice_profiles`; **never re-fetched per post**
- [ ] Refreshes monthly via scheduled task, or on demand
- [ ] With fewer than 5 sample posts, falls back to brand tone markers and says so in the UI
- [ ] User can view the extracted voice summary and override it in plain text

---

## F4 — Post generation · Phase 2

**Acceptance**
- [ ] Ideas dedupe against 90 days at cosine > 0.85
- [ ] Archetype variety enforced; `launch` capped at 1 per 2 weeks per project
- [ ] One writing call per platform; Reddit uses a separate prompt
- [ ] Every draft records `usedKnowledgeIds` — no post without provenance (Rule 6)
- [ ] Slop Critic runs on every draft; score > 0.6 auto-regenerates once
- [ ] "Insufficient material" surfaces as a request for input, never as invented content
- [ ] Generation is inspectable: user can see which facts produced this post

---

## F5 — Review and edit · Phase 2

**Acceptance**
- [ ] Platform-accurate preview (real fonts, real char limits, real truncation points)
- [ ] Inline editing with live character count; over-limit blocks scheduling
- [ ] Approve · regenerate · discard on every draft
- [ ] `editDistance` recorded on every published post
- [ ] Regenerate offers "different angle" vs "same angle, rewritten"
- [ ] Undo after edit, before publish

---

## F6 — Channels · Phase 3

**Acceptance**
- [ ] OAuth connect for X, LinkedIn, Instagram, TikTok via PostPeer; Reddit direct
- [ ] Handle, display name, avatar shown after connect
- [ ] Health state visible: healthy / expiring / needs re-auth / revoked
- [ ] Instagram Business-account requirement explained **before** the OAuth wall
- [ ] TikTok shows username + avatar and a privacy selector before publish (platform requirement)
- [ ] Disconnect removes tokens immediately and cancels that channel's queued posts
- [ ] Tokens encrypted at rest; never logged, never in Sentry breadcrumbs

---

## F7 — Scheduling · Phase 3

**Acceptance**
- [ ] Per-channel cadence: days of week, times of day, user's IANA timezone
- [ ] ±7 min jitter applied to every scheduled time
- [ ] Queue fills 14 days forward
- [ ] DST transitions handled correctly (Trigger.dev timezone-aware schedules)
- [ ] Drag to reschedule in the queue
- [ ] Pause a channel or a whole project without losing the queue

---

## F8 — Publishing · Phase 3

The critical path. See [`tech-architecture.md`](tech-architecture.md).

**Acceptance**
- [ ] Idempotent: killing the worker mid-publish and retrying never double-posts
- [ ] Row claimed with `FOR UPDATE` before any platform call
- [ ] **X: URLs stripped from body, published as first reply.** Enforced in code, unit-tested
- [ ] Reply failure doesn't roll back or retry the parent post
- [ ] Transient failures retry with backoff, max 5; permanent failures hold with a reason
- [ ] Every result stores `platformPostId` and `permalink`
- [ ] Token refreshed inline if expiring within 24h
- [ ] User never sees a raw platform error string

---

## F9 — Reddit safety · Phase 4

The moat. See [`reddit-safety.md`](reddit-safety.md).

**Acceptance**
- [ ] All six checks run on every Reddit publish; no bypass flag exists anywhere in the codebase
- [ ] All six run even after the first failure — user sees every problem at once
- [ ] Results written to `safety_checks` for pass and fail alike
- [ ] Held posts explain which check failed, why, and what to do
- [ ] Duplicate check blocks cross-subreddit reposts unconditionally
- [ ] Self-promo ratio visible as a live counter in the UI
- [ ] Rules cache refreshes when older than 7 days; a fetch failure holds the post (fail closed)
- [ ] Reddit drafts are independently generated, never reformatted from another platform

---

## F10 — Subreddit recommendation · Phase 4

**Acceptance**
- [ ] 5–10 suggestions derived from the brand profile
- [ ] Each shows subscribers, self-promo stance, karma/age requirements, risk rating
- [ ] Red-rated subs are shown but never auto-added
- [ ] User can add any sub manually; rules fetched on add
- [ ] A sub that can't be fetched or is private is rejected with an explanation

---

## F11 — Billing and limits · Phase 5

**Acceptance**
- [ ] Dodo checkout for 3 plans; webhook updates subscription state; signature verified
- [ ] Limits enforced **server-side**: projects, channels, posts/month
- [ ] Trial = 10 posts total across all platforms and channels, no card
- [ ] Hitting the trial cap shows an upgrade prompt, not an error
- [ ] Usage visible in settings against plan limits
- [ ] Downgrade handled gracefully — excess channels paused, not deleted
- [ ] Failed payment → grace period → pause queue, don't delete anything

---

## F12 — Attribution · Phase 5

**Acceptance**
- [ ] Short links on our own domain, one per scheduled post
- [ ] Redirect is fast (edge) and records a click
- [ ] Click counts per post, per channel, per week
- [ ] No raw IPs or user agents stored — hashed only
- [ ] User can turn short links off per project (some prefer clean URLs)

---

## F13 — Digest and nudges · Phase 5

**Acceptance**
- [ ] Weekly digest: published, queued, clicks, needs-review
- [ ] Re-auth email fires the moment a channel becomes unhealthy, not on a schedule
- [ ] Autopilot **off** + unreviewed at fire time → hold + nudge, never publish
- [ ] Autopilot **on** + unreviewed → publish (they opted in) and say so in the digest
- [ ] All emails have working unsubscribe; transactional and marketing kept separate

---

## F14 — Dashboard · Phase 5

Deliberately minimal. Three numbers.

**Acceptance**
- [ ] Posts published this week
- [ ] Clicks to your site this week
- [ ] Items needing review, linked to the queue
- [ ] Nothing else. No engagement graphs, no follower charts, no vanity metrics

---

## V1.1

**F15 MCP server** — `list_projects`, `add_knowledge`, `generate_post`, `schedule_post`,
`list_queue`, `check_reddit_safety`. Hosted endpoint + skills package.

**F16 Shadowban detection** — logged-out permalink check 30 min post-publish; alert and pause on 404.

**F17 GitHub releases source** — webhook or poll; near-free knowledge for dev tools.

**F18 Engagement metrics** — LinkedIn and Reddit only (free reads). X stays opt-in and clearly priced.

## Related

- [`mvp-scope.md`](mvp-scope.md) — build order
- [`data-model.md`](data-model.md) — tables behind each feature
