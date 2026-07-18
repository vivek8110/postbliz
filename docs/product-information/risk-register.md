# Risk Register

Ordered by expected damage. Review monthly — 10 minutes, first Monday.

---

## 🔴 Critical

### R1 — Generated content isn't good enough

**The one that kills the product.** If posts read as AI, our entire differentiation evaporates and
we're a worse post-bridge at 3× the price.

*Signals:* median edit distance > 0.3 · users editing every post · month-2 churn > 50% · nobody
sharing their generated posts.

*Mitigations:* the grounding pipeline is the mitigation (Rule 6 — no post without a fact) · Slop
Critic on every draft · edit distance tracked from day one · **you are the first user, and you'd
notice.**

*If it happens:* stop all feature work. Fix generation. Nothing else matters — a product with bad
output and great features is still a dead product.

### R2 — Content runs dry in week three

Site crawl yields ~30 facts. At 15 posts/week that's exhausted in 2–3 weeks, after which the model
paraphrases itself and we hit R1.

*Signals:* knowledge items with `timesUsed` > 3 · rising idea-dedupe rejection rate · engagement
falling over time.

*Mitigations:* ongoing sources are **MVP scope, not V2** · the Friday brain-dump email · in-app
warning when the knowledge base is thin · refuse to generate rather than repeat.

### R3 — Someone gets banned and posts about it

Reputational, not legal. The ToS puts account outcomes on the user, which is the right legal
position, but a public *"Postbliz got my account banned"* in r/SaaS costs far more than the
subscription.

*Mitigations:* all six checks, no bypass · conservative defaults, fail closed · we hold rather than
publish when uncertain · visible self-promo ratio educates users · shadowban detection in V1.1.

*If it happens:* respond publicly, fast, and honestly. Explain what the checks do, what happened, and
what changed as a result. A well-handled incident is better marketing than no incident.

---

## 🟠 High

### R4 — post-bridge adds Reddit + generation

Our closest competitor, ~1,405 customers, an existing audience, and a solo founder who ships fast. If
Jack adds Reddit safety and grounded generation, our differentiation narrows to almost nothing.

*Mitigations:* speed — be known as the Reddit-safe tool before they arrive · depth (six checks and
accumulated rules data is more work than it looks) · they're anchored at $9–26 and adding this costs
real money · **track their changelog monthly.**

*Honest assessment:* we can't prevent this. We can only be first and be deeper.

### R5 — PostPeer fails, prices up, or disappears

A small provider. Four of our five platforms depend on them.

*Mitigations:* **every call goes through `lib/platforms/postpeer.ts`** — swapping is an adapter
change, not a rewrite · Zernio and bundle.social both support our platforms *and* Reddit as fallbacks
· Reddit is already direct, so the moat is unaffected · ask about their SLA and exit process before
launch.

*Trigger:* any outage over 4 hours, or a price rise over 50%, starts the fallback build.

### R6 — X pricing changes again

Already moved to pay-per-use with a 13× surcharge on links. It could move again.

*Mitigations:* link-in-reply already cuts exposure 10× · X is one of five platforms, not the product ·
usage is metered per project so a spike is visible immediately · monthly OpenRouter and PostPeer
spend caps.

*If X becomes unviable:* drop it. LinkedIn and Reddit carry the product for our ICP.

### R7 — LLM costs run away

The one line that can silently exceed revenue.

*Mitigations:* tiered routing (cheap for extraction, frontier only for drafting) · token logging on
every call to `usage_counters` · **OpenRouter monthly cap set on day one** · alert if any project
exceeds $5/month · plan caps as a backstop.

---

## 🟡 Medium

### R8 — Token expiry churns users silently

LinkedIn tokens die every 60 days, TikTok every 24 hours. A silently dead channel means a queue
draining into nothing and a user who churns without ever telling you why.

*Mitigations:* proactive daily refresh at 72h · immediate email on failure · in-app banner · **pause
the queue rather than fail silently.**

### R9 — Solo founder capacity

25–30 hrs/week alongside a full-time job. Illness, work crunch, or burnout stops everything.

*Mitigations:* boring stack, minimal moving parts · docs (this set) so a paused project can be
resumed · every phase shippable independently · **don't over-commit publicly to dates.**

### R10 — Onboarding crawl fails on real sites

SPAs, auth walls, thin landing pages. If the crawl fails, activation fails at step one.

*Mitigations:* Firecrawl handles JS rendering · detect thin content and immediately request a brain
dump · manual fallback: paste your description · **never show an empty brand profile.**

### R11 — Open-sourcing helps a competitor

The Reddit engine and prompts are public.

*Mitigations:* AGPL prevents closed-source SaaS forks · CLA keeps relicensing options open · the data
moat (cached rules, tuning) isn't in the repo · accepted deliberately — see
[`open-source.md`](open-source.md).

### R12 — Meta / TikTok approval blocks IG and TikTok

*Mitigation:* PostPeer has already cleared both audits. This is precisely why we're renting rather
than building. Never attempt our own TikTok app — unaudited apps are capped at 5 users per 24h with
forced-private posts.

---

## 🟢 Lower

**R13 — Reddit commercial licensing.** Free at 100 req/min; a contract is needed at scale (~$0.24 per
1k calls). Far below the threshold at MVP. *Revisit at 500 users.*

**R14 — Neon / Trigger.dev / Vercel outage.** Standard vendor risk. Jobs retry; a missed post is
recoverable. Acceptable.

**R15 — Dodo Payments issues.** Newer provider. Effective rate ~6%, not the 4% headline. No ACH/SEPA
support. *Fallback:* Paddle or Creem, both a few days of work.

**R16 — GDPR / data protection.** We store social tokens and third-party click data. *Mitigations:*
encrypt tokens, hash IPs and user agents, no raw PII on clicks, deletion endpoint, plain privacy
policy.

---

## Week 12 checkpoint

**Not a kill date — a decision point.** The value of writing this now is that you're unattached today
and won't be in twelve weeks.

| Situation | Read | Do |
|---|---|---|
| 0 paying customers | Positioning or activation is broken | **Stop building.** Talk to 20 users. Don't write code until you know why |
| 1–5 paying, low churn | Working, distribution is the gap | Pour everything into [`GTM.md`](GTM.md) |
| 1–5 paying, high churn | R1 or R2. Content quality | Fix generation. No new features |
| 5+ paying, churn < 40% | It works | Scale it |
| Not shipped yet | Scope crept | Cut to X + LinkedIn only. Ship in 2 weeks |

**Be honest at this checkpoint.** The sunk cost will be ten weeks of evenings and it will argue
loudly for continuing regardless of the data. Write down now what you'll do, so the decision is
already made when you're too invested to make it well.

## Related

- [`mvp-scope.md`](mvp-scope.md) · [`competitors.md`](competitors.md) · [`pricing-and-unit-economics.md`](pricing-and-unit-economics.md)
