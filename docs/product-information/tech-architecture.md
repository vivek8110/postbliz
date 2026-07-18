# Technical Architecture

## Principle

**Buy the commodity, build the moat.** Publishing to X/LinkedIn/IG/TikTok is a solved, undifferentiated
problem — rent it from PostPeer. Reddit safety and grounded generation are the product — build those
ourselves, own the code, own the quality.

Second principle: **a solo founder with 25 hrs/week can maintain about four moving parts.** Every
addition to the stack must displace something or justify itself loudly.

---

## Stack

| Layer | Choice | Why this one |
|---|---|---|
| Framework | Next.js 15+ App Router | RSC, one deployable, one language |
| Language | TypeScript, `strict: true` | |
| DB | Postgres on **Neon** | Branch-per-PR, serverless, scales to zero |
| ORM | **Drizzle** | Better inference than Prisma, no engine binary, edge-safe |
| Auth | **BetterAuth** | Self-hosted, TS-native, no per-MAU tax as you grow |
| Jobs | **Trigger.dev v4** | Durable cron, long-running tasks, per-user schedules, retries |
| Crawl | **Firecrawl** | Never write and maintain a scraper |
| LLM | **Vercel AI SDK** → **OpenRouter** | One interface, swap models per task tier |
| Object storage | **Cloudflare R2** | Zero egress. Neon is Postgres only — it has no bucket |
| Email | **Resend** | React Email, good deliverability |
| Payments | **Dodo Payments** | MoR handles global tax. Budget **~6% effective** |
| Publishing (4) | **PostPeer** | Unlimited connected accounts, credit-based |
| Publishing (Reddit) | **Direct, Reddit OAuth** | Free, self-serve, and it's the moat |
| Analytics | **PostHog** | Funnels + flags + session replay |
| Errors | **Sentry** | |
| Hosting | **Vercel** | |

---

## System shape

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js (Vercel)                                           │
│  ├── app/(marketing)      public, static, SEO/GEO           │
│  ├── app/(app)            authed dashboard, RSC              │
│  └── app/api/             webhooks only (Dodo, PostPeer,     │
│                           Reddit) + short-link redirect      │
└────────────┬────────────────────────────────────────────────┘
             │ enqueue
             ▼
┌─────────────────────────────────────────────────────────────┐
│  Trigger.dev v4 — everything that touches a third party      │
│                                                              │
│  ingest.crawl-site      ingest.poll-rss                     │
│  generate.ideas         generate.draft                       │
│  queue.fill             publish.execute  ← critical path     │
│  reddit.sync-rules      reddit.safety-gate                   │
│  tokens.refresh-expiring    digest.weekly                    │
└────────────┬────────────────────────────────────────────────┘
             │
    ┌────────┴──────────┬──────────────┬──────────────┐
    ▼                   ▼              ▼              ▼
 Neon Postgres       R2 media     PostPeer API   Reddit API
                                  (4 platforms)   (direct)
```

**The rule:** API routes never call third parties. They validate, enqueue, and return. Tasks execute.
This gives you retries, observability, and no serverless timeouts for free.

---

## Key flows

### Onboarding

```
URL entered
  → ingest.crawl-site (Firecrawl, ~20s)
  → extract brand_profile      (1 LLM call, structured output)
  → extract knowledge_items    (1 LLM call, batched)
  → recommend subreddits       (1 LLM call, from brand profile)
  → generate.ideas → generate.draft ×3
  → show first 3 posts
```

Stream progress with Trigger.dev Realtime. The user watches it work — the perceived-effort of the
crawl is doing marketing for you. Do not hide it behind a spinner.

**Target: first previewable post in under 60 seconds.** This single number decides activation.

### Publishing (the critical path)

```
queue.fill (daily, per project)
  → creates scheduled_posts with idempotency_key + fire time (± 7 min jitter)

publish.execute (triggered at fire time via delay)
  1. SELECT ... FOR UPDATE — claim the row, status queued → publishing
     (if already publishing/published, exit silently — this is the retry guard)
  2. Reddit? → run reddit.safety-gate. Any fail → status held, notify, stop
  3. Token check → refresh if expiring within 24h
  4. X? → strip URLs from body
  5. Platform call
  6. Success → status published, store platform_post_id + permalink
     X with link → publish reply containing the URL
  7. Failure → classify:
       transient (429, 5xx, network) → retry, exponential backoff, max 5
       permanent (auth, policy, validation) → status held + plain-language reason
```

**Idempotency is non-negotiable.** Unique constraint on `scheduled_posts.idempotency_key`, plus the
claim-row-first pattern. A double-post is worse than a missed post: it's visible, embarrassing, and
on some platforms it's a spam signal.

### Token refresh

Two layers, because reactive-only will fail during an outage:

1. **Proactive** — `tokens.refresh-expiring` runs daily, refreshes anything expiring within 72h
2. **Reactive** — publish job checks expiry immediately before the call, refreshes inline if needed

LinkedIn access tokens last 60 days with 365-day refresh tokens. TikTok access tokens last 24 hours.
If a refresh fails, mark the channel unhealthy and email the user immediately — a silent dead channel
is how you lose someone without ever hearing from them.

---

## LLM strategy — your biggest cost lever

Route by task, not by habit. Careless routing can cost more per user than you charge them.

| Task | Tier | Why |
|---|---|---|
| Knowledge extraction | Cheap/fast | High volume, structured output, low judgment |
| Dedupe / similarity | Embeddings only | No generation needed |
| Idea generation | Mid | Some judgment, short output |
| **Post drafting** | **Frontier** | This is the product. Do not cheap out here |
| Anti-slop review | Mid | Checklist evaluation |
| Subreddit matching | Mid | |

**Rules:**
- Always use structured outputs (`generateObject`) — cheaper to parse, no repair loops
- Cache the brand profile and voice profile. They change monthly, not per post
- Batch knowledge extraction. One call for ten pages, not ten calls
- Log token spend per project to `usage_counters`. You need to see a runaway before the bill does
- Set an OpenRouter monthly spend cap from day one

See [`pricing-and-unit-economics.md`](pricing-and-unit-economics.md) for the actual numbers.

---

## Security

**Token encryption.** AES-256-GCM, key from `ENCRYPTION_KEY` env var, one helper in `lib/crypto.ts`.
Encrypt on write, decrypt only inside the publish task, never in a route handler, never logged, never
in a Sentry breadcrumb. Add a Sentry `beforeSend` scrubber for anything matching token patterns.

**Repo is public.** Assume every commit is read by a stranger. `.env.example` only. Consider a
pre-commit secret scanner (`gitleaks`) — cheap insurance.

**Multi-tenancy.** Every query filters by `user_id` through a scoped query helper. Do not hand-write
`where` clauses on user data. One missed filter in a public repo is a disclosed vulnerability.

**Webhooks.** Verify signatures on Dodo and PostPeer. Reject unsigned. Idempotent handlers — webhooks
retry and will arrive twice.

---

## Performance and cost notes

- The dashboard is RSC by default. Only the composer and queue drag interactions are client
- Media never touches the Next.js server — presigned R2 uploads direct from the browser
- Neon scales to zero; expect cold starts on the free tier. Fine for MVP, upgrade at ~50 users
- Trigger.dev bills per compute-second. Keep tasks short; don't sleep inside them, use `delay`

---

## Environment variables

```
DATABASE_URL                Neon
BETTER_AUTH_SECRET
BETTER_AUTH_URL
ENCRYPTION_KEY              32-byte, base64. Rotating this invalidates all stored tokens
TRIGGER_SECRET_KEY
FIRECRAWL_API_KEY
OPENROUTER_API_KEY
POSTPEER_API_KEY
REDDIT_CLIENT_ID            our own app, direct integration
REDDIT_CLIENT_SECRET
REDDIT_USER_AGENT           required by Reddit; must identify the app honestly
R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET
RESEND_API_KEY
DODO_API_KEY / DODO_WEBHOOK_SECRET
NEXT_PUBLIC_POSTHOG_KEY
SENTRY_DSN
SHORTLINK_DOMAIN
```

## Related

- [`data-model.md`](data-model.md) — schema
- [`platform-integrations.md`](platform-integrations.md) — per-platform detail
- [`app-agents.md`](app-agents.md) — the generation pipeline as agents
