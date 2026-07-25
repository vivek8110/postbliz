# Postbliz

Social publishing for people who build things. A founder points Postbliz at their product URL,
connects their accounts, and gets posts that **explain what they built** — written so they read
as human, survive Reddit's moderators, and don't trip anyone's AI-slop detector.

> **One sentence:** It writes posts that explain what you built, the way you'd explain it to a
> friend — so they don't read as ads, don't read as AI, and don't get you banned from Reddit.

---

## Read this first

This file is loaded every session. It is deliberately short. **Do not duplicate detail here** —
put it in the right doc under `docs/product-information/` and link to it.

| Doc | Read it when |
|---|---|
| [`docs/phases/`](docs/phases/README.md) | **Start here for any build work.** One runbook per phase, with the exact prompts and gates |
| [`product-brief.md`](docs/product-information/product-brief.md) | You need the why, the wedge, the non-goals |
| [`ICP.md`](docs/product-information/ICP.md) | Writing copy, choosing defaults, deciding UX tradeoffs |
| [`mvp-scope.md`](docs/product-information/mvp-scope.md) | The scope overview. The phase files are the executable version |
| [`features.md`](docs/product-information/features.md) | Implementing a feature; per-feature acceptance criteria |
| [`tech-architecture.md`](docs/product-information/tech-architecture.md) | Any backend, infra, or job-queue work |
| [`data-model.md`](docs/product-information/data-model.md) | Any DB work. Drizzle schema lives here |
| [`platform-integrations.md`](docs/product-information/platform-integrations.md) | Anything touching X, LinkedIn, Reddit, IG, TikTok |
| [`content-system.md`](docs/product-information/content-system.md) | Prompts, generation pipeline, anti-slop rules |
| [`reddit-safety.md`](docs/product-information/reddit-safety.md) | Reddit. Do not touch Reddit without reading this |
| [`app-agents.md`](docs/product-information/app-agents.md) | Runtime agent design + dev subagents |
| [`design.md`](docs/product-information/design.md) | Any UI work, or generating designs in Claude Design |
| [`pricing-and-unit-economics.md`](docs/product-information/pricing-and-unit-economics.md) | Billing, plan limits, anything that costs money per call |
| [`competitors.md`](docs/product-information/competitors.md) | Positioning, pricing, feature triage |
| [`GTM.md`](docs/product-information/GTM.md) · [`growth.md`](docs/product-information/growth.md) · [`seo-geo.md`](docs/product-information/seo-geo.md) | Launch, acquisition, content marketing |
| [`open-source.md`](docs/product-information/open-source.md) | Repo structure, license, what's public, self-host |
| [`risk-register.md`](docs/product-information/risk-register.md) | Before committing to anything with a platform dependency |
| [`decisions.md`](docs/product-information/decisions.md) | **Why** something is the way it is. Append here when you decide something |

---

## Hard rules

These are not preferences. Breaking one causes real damage — money, bans, or lost trust.

1. **Never put a link in an X post body.** Links go in the first reply. X charges $0.20 per post
   containing a URL vs $0.015 without — a 13× surcharge that destroys our margin. This is enforced
   in code, not left to the model. See [`pricing-and-unit-economics.md`](docs/product-information/pricing-and-unit-economics.md).

2. **Never publish to Reddit without running the full safety gate.** All six checks, every time.
   A banned customer is a churned customer plus a public complaint. See [`reddit-safety.md`](docs/product-information/reddit-safety.md).

3. **Never post identical content to two subreddits.** Hard block at the DB level, not a warning.

4. **Never store OAuth tokens or API keys in plaintext.** Encrypted at rest, decrypted only inside
   the publish job. We hold the keys to people's audiences.

5. **Every publish is idempotent.** One `idempotency_key` per scheduled post, unique constraint in
   Postgres, state machine transitions only. A retry must never double-post.

6. **Never generate a post from nothing.** Every post traces back to a `knowledge_item` with a
   source. No source, no post. This is the entire anti-slop mechanism.

7. **Never invent facts about the user's product.** If the model isn't grounded in a knowledge
   item, it must return "insufficient material," not a plausible sentence.

8. **This repo is public.** No secrets, no customer data, no internal-only notes in code or docs.
   See [`open-source.md`](docs/product-information/open-source.md).

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16+, App Router, RSC | TypeScript strict |
| DB | Postgres on Neon | Branch per PR |
| ORM | Drizzle | Schema is source of truth |
| Auth | BetterAuth | Self-hosted, no per-MAU cost |
| Jobs | Trigger.dev v4 | All scheduling, publishing, generation |
| Crawl | Firecrawl | Never write a scraper |
| LLM | Vercel AI SDK → OpenRouter | Model routing by task tier |
| Storage | Cloudflare R2 | **Not** Neon. Neon is Postgres only |
| Email | Resend | Digests, re-auth nudges |
| Payments | Dodo Payments | MoR. Budget ~6% effective, not 4% |
| Publishing | PostPeer (X, LinkedIn, IG, TikTok) + **direct Reddit** | Buy the commodity, build the moat |
| Analytics | PostHog | Product analytics + feature flags |
| Errors | Sentry | |
| UI | Tailwind + shadcn/ui | See [`design.md`](docs/product-information/design.md) |

**USD only.** No INR pricing.

---

## Conventions

**Structure** — `app/` routes, `lib/` domain logic, `db/` schema + queries, `trigger/` jobs,
`components/ui/` shadcn primitives, `components/` app components.

**Naming** — files `kebab-case.ts`, React components `PascalCase`, DB tables `snake_case` plural,
Drizzle exports `camelCase` singular (`postVariants` → table `post_variants`).

**Domain language** — use these words everywhere, in code and UI:

| Term | Means |
|---|---|
| **Project** | One product being promoted. A user has many |
| **Channel** | One connected social account on one platform |
| **Source** | A place facts come from — site crawl, RSS, changelog, brain dump |
| **Knowledge item** | One extracted fact with provenance |
| **Idea** | An angle for a post, before it's written |
| **Draft** | Platform-specific written content, not yet scheduled |
| **Queued** | Scheduled, will publish |
| **Held** | Failed a safety check, needs the user |

Do not say "content," "campaign," or "brand asset." Say what it is.

**Errors** — never swallow. Every platform call returns a discriminated union, never throws into
the void. Failures are surfaced to the user in plain language: what happened, what to do.

**Jobs** — anything that calls a third party is a Trigger.dev task, never an API route. Routes
enqueue, tasks execute.

**Money** — before writing code that calls a paid API in a loop, check
[`pricing-and-unit-economics.md`](docs/product-information/pricing-and-unit-economics.md) and do
the math for 1,000 users.

---

## When you finish a meaningful piece of work

Append an entry to [`decisions.md`](docs/product-information/decisions.md) if you made a call that
a future session would otherwise re-litigate. Record what you chose, what you rejected, and why.
The "why" is the part that's expensive to reconstruct.

---

## Context

Solo founder, ~25–30 hrs/week alongside a full-time job. This constraint is real and should shape
every recommendation: prefer the boring solution, prefer fewer moving parts, prefer shipping the
thin version. **Target: first paying customer in 8–10 weeks.**

When a task can be done two ways, pick the one that can be finished in one sitting.
