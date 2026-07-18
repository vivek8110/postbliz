# Growth

GTM gets the first 100. This is what happens after — and the honest truth is that **retention is the
growth strategy** for a product like this. A leaky bucket cannot be filled by a solo founder working
evenings.

---

## The one metric

**Month-2 retention.** Everything else is a leading indicator of it.

Signups prove the landing page worked. Month-2 renewal proves the product did. If it's above 60%,
pour everything into distribution. If it's below 40%, stop building features and fix content quality.

---

## Growth loops

### Loop 1 — The product is the marketing ⭐

```
User publishes a Postbliz post
  → post is good and specific, not slop
  → someone asks "what are you using?"
  → they mention Postbliz
```

The strongest loop available, and it only works if the output is genuinely good. **This is why
content quality is a growth investment, not a polish investment.**

Amplify it, carefully:
- Optional "written with Postbliz" footer — **off by default**, opt-in only. Our ICP hates
  attribution badges. Offer a discount for enabling it and let them choose
- Public showcase of real posts, with permission
- **Dogfood permanently.** Every Postbliz post about Postbliz is a live demo

### Loop 2 — Open source

```
Repo trends / gets shared
  → developers star, fork, self-host
  → some self-hosters convert to cloud
  → contributors improve the product for free
```

Postiz proves this works at $1.3M ARR. See [`open-source.md`](open-source.md) — but note the honest
math: most self-hosters never pay. The value is *distribution and credibility*, not conversion.

### Loop 3 — Reddit expertise as content

```
Publish real findings about subreddit rules and self-promo norms
  → indie founders share it (genuinely useful)
  → establishes us as the Reddit-safe tool
  → cited by AI answer engines
```

We accumulate proprietary data nobody else has: cached rules across hundreds of subs, which posts got
held and why, which subs are actually promo-friendly. **Publish an annual "State of Self-Promotion on
Reddit" report** from aggregate, anonymised data. It's original research — the most citable asset
type there is.

### Loop 4 — MCP distribution (V1.1)

```
Developer installs the Postbliz MCP in Claude Code
  → says "add that to Postbliz" after a deploy
  → the changelog problem solves itself
  → they become a heavy user, then an advocate
```

Small audience today, growing fast, and it's *exactly* our ICP in the tool they already live in.

---

## Activation

Where growth actually dies. Instrument every step in PostHog.

```
Signup           100%
  ↓ enters URL     85%   ← if lower, the value prop is unclear
  ↓ crawl OK       80%   ← technical failures here are lethal
  ↓ sees a post    75%   ← THE moment. Everything hinges here
  ↓ connects one   55%   ← OAuth friction, especially Instagram
  ↓ publishes      45%   ← the activation event
  ↓ week-2 return  30%   ← the retention signal
```

**The first generated post is the entire product.** If it's bad, they close the tab and never come
back. There is no second impression.

Spend disproportionate effort there: slower and better beats faster and generic. 60 seconds of
visible crawling that produces a great post beats 10 seconds that produces a mediocre one.

---

## Retention

### Why people churn

| Reason | Fix |
|---|---|
| **Content ran dry / got repetitive** | Ongoing sources. The single biggest one. See [`content-system.md`](content-system.md) |
| Posts didn't sound like them | Voice profile + edit-distance monitoring |
| Channel died silently | Aggressive re-auth nudges. Never let a queue drain into a dead channel |
| Saw no results | Weekly digest with click counts. Honest, small numbers beat silence |
| Forgot it existed | Weekly digest. The Friday brain-dump email |
| Got banned | The six checks. Ship them all |

### The Friday email is the retention mechanic

*"What did you ship this week?"* — one textarea, reply-to-email works.

It does three things at once: keeps the knowledge base fresh, reminds them the product exists, and
creates a weekly habit. **Treat its response rate as a core metric.** Nothing else in the product
does this much for this little effort.

### Early-warning signals

Watch these in PostHog and intervene manually while you're small enough to:

| Signal | Meaning | Action |
|---|---|---|
| Edit distance rising above 0.3 | Quality degrading | Investigate prompts now, not next month |
| No new knowledge in 14 days | About to run dry | Prompt for a brain dump in-app |
| Queue emptying, not refilling | Disengaging | Personal email. Ask what's wrong |
| Channel unhealthy > 3 days | Will churn silently | Email, then email again |
| Zero logins in 10 days | Nearly gone | Personal email from you, not a template |

**Under 100 customers, email people personally.** It doesn't scale and that's fine — it isn't
supposed to yet. It's the highest-signal research available.

---

## Expansion

Natural upgrade paths, no pressure required:

1. **Second project.** Indie hackers always have another side project. This is the most natural
   expansion in the product — make adding one delightful
2. More channels
3. Higher volume
4. X voice profiling (paid tier — the cost is real)

**No usage-anxiety pricing.** Never make someone hesitate before generating a post.

---

## What not to do

- **No referral program** before product-market fit. Referrals from a leaky product accelerate churn
- **No free tier.** Trial converts; free tiers attract people who never will and cost real LLM money
- **No feature launches for growth.** Nobody switches tools for a feature. They switch for a job
- **No affiliate program** until retention is proven. Affiliates optimise for signups, not fit

## Related

- [`ICP.md`](ICP.md) · [`GTM.md`](GTM.md) · [`pricing-and-unit-economics.md`](pricing-and-unit-economics.md)
