# Pricing and Unit Economics

**USD only.** No INR pricing.

---

## Model: per-project with caps. Not credits.

Credits make people ration their posting. This product's value depends entirely on consistency — a
user who posts less sees no results and churns. **Never price against your own value metric.**

Our real cost driver is X-posts-containing-links, and that's solved in *product design* (link in the
reply), not in pricing. So caps can be generous.

### Plans (provisional — validate with the first 20 customers)

| | **Trial** | **Solo** | **Pro** | **Studio** |
|---|---|---|---|---|
| Price | Free | $19/mo | $49/mo | $99/mo |
| Projects | 1 | 1 | 3 | 10 |
| Channels | 1 | 3 | 10 | Unlimited |
| Posts/month | **10 total** | 60 | 300 | 1,000 |
| Reddit safety | ✅ | ✅ | ✅ | ✅ |
| Voice profile (LI/Reddit) | ✅ | ✅ | ✅ | ✅ |
| Voice profile (X) | — | — | ✅ | ✅ |
| Sources | 1 | 3 | 10 | Unlimited |
| Card required | **No** | — | — | — |

**Trial = 10 posts total across all platforms and channels.** Not 10 per platform. One counter,
counts every publish. Hitting it shows an upgrade prompt, not an error.

No card on trial. Our ICP is suspicious of card walls, and 10 posts costs us under $0.50 to serve.

**Reddit safety is on every plan, including trial.** It's the moat — putting it behind a paywall
means most users never see the thing that makes us different.

### Annual

20% off (2 months free). Worth offering from day one — cash up front matters when you're
bootstrapping, and annual customers churn far less.

---

## Cost per user

### PostPeer credits

| Action | Credits |
|---|---|
| LinkedIn / Instagram / TikTok | 1 |
| X **without** a URL in the body | 5 |
| X **with** a URL in the body | **50** |
| Analytics request | 1 |

Reddit costs us **zero** (direct integration, free tier at 100 req/min).

### The 10× decision

100 customers, 21 X posts/month each = 2,100 X posts.

| Approach | Credits | Cost @ $6/1k |
|---|---|---|
| Link in post body | 105,000 | **$630/mo** |
| **Link in first reply** | 10,500 | **$63/mo** |

**A 10× swing from one line of code.** This is why it's Hard Rule 1 in [`CLAUDE.md`](../../CLAUDE.md).

It's also better for reach — X deprioritises posts that send people off-platform — so there is no
tradeoff to weigh. The cheap path is the good path.

### Monthly COGS at 100 customers

Assumption: 3 channels each, ~60 posts/month, links in replies.

| Line | Cost | Notes |
|---|---|---|
| PostPeer | $120 | Pro, 20k credits |
| Neon | $69 | Scale tier |
| Trigger.dev | $50 | |
| Vercel | $20 | Pro |
| Firecrawl | $16–83 | Depends on crawl frequency |
| **LLM (OpenRouter)** | **$30–500** | **The variable that decides everything** |
| R2 | $5–15 | Media only |
| Resend | $20 | |
| PostHog / Sentry | $0–30 | Free tiers go far |
| **Total** | **$330–900** | |

At 100 × $29 blended = **$2,900 MRR**, that's **11–31% COGS** before payment fees.

### The LLM line

The only line that can run away. Per post:

| Stage | Tier | Est. cost |
|---|---|---|
| Ideation (amortised) | Mid | $0.002 |
| Drafting | Frontier | $0.010–0.030 |
| Slop review | Mid | $0.002 |
| **Per post** | | **~$0.015–0.035** |

60 posts/month ≈ **$0.90–2.10/customer**. Plus onboarding (~$0.15 one-off) and monthly voice refresh
(~$0.02).

**Controls, all mandatory:**
- Cheap tier for extraction and dedupe; frontier only for the final draft
- Batch extraction — one call for 10 pages
- Cache brand and voice profiles. Never regenerate per post
- Log every call's tokens to `usage_counters`
- **Set an OpenRouter monthly spend cap on day one**

Careless routing turns $2/customer into $15/customer. That's the difference between a business and a
hobby with a bill.

---

## Payment fees — Dodo

Headline is 4% + 40¢, but **subscriptions add +0.5% and international cards add +1.5%.** For a global
SaaS selling subscriptions, the real rate is **~6%**.

**Budget 6%, not 4%.** On $29: ~$2.14 to Dodo.

Note also: Dodo doesn't support ACH, SEPA Direct Debit, or BACS. Irrelevant for self-serve SaaS at
our price point, but worth knowing.

Chosen because it's an MoR — it handles global VAT/GST/sales tax registration and remittance, which
is otherwise a genuinely painful problem for an India-based founder selling worldwide. That's worth
the ~2% premium over a raw gateway.

---

## Contribution margin

Single customer, Solo plan, 60 posts/month, 3 channels:

| | |
|---|---|
| Revenue | $19.00 |
| Dodo (~6%) | −$1.14 |
| PostPeer | −$0.35 |
| LLM | −$1.50 |
| Firecrawl / R2 / email | −$0.25 |
| Infra (amortised @ 100 users) | −$1.60 |
| **Contribution** | **$14.16 (75%)** |

Healthy. The margin holds as long as the LLM line stays disciplined and X links stay in replies.

**Break-even on fixed infra: ~15 customers.**

---

## Metrics to instrument (PostHog, from day one)

| Metric | Target |
|---|---|
| Signup → first generated post | > 80% |
| First post → first publish | > 60% |
| **Trial → paid** | **> 8%** |
| **Month-2 retention** | **> 60%** ← the number that matters |
| Median edit distance | < 0.3 |
| Posts published per active user/week | > 5 |
| LLM cost per customer | < $2.50 |
| Reddit posts held / attempted | 10–30% (0% means the gate isn't working) |

**Month-2 retention is the only number that tells you whether the product works.** Everything else is
a leading indicator of it.

---

## Pricing principles

1. **Don't compete on price.** post-bridge is $9. That fight is unwinnable and unnecessary — we solve
   a different problem.
2. **Raise prices before adding a cheaper tier.** A $9 tier attracts users who churn fastest and
   support hardest.
3. **Grandfather early customers permanently.** Costs little, buys enormous goodwill, and the first
   50 people are your marketing.
4. **Caps are guardrails, not products.** Nobody should hit them in normal use. If many do, the caps
   are wrong.
5. **Revisit at 50 customers**, with real usage data instead of these estimates.

## Related

- [`platform-integrations.md`](platform-integrations.md) — the X link rule
- [`competitors.md`](competitors.md) — the price field
- [`risk-register.md`](risk-register.md) — what breaks these numbers
