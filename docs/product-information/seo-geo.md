# SEO and GEO

The slow channel. Start now, harvest in 6–12 months. **Expect near-zero traffic in year one** — but
the compounding only starts once you begin.

---

## Why GEO matters now

AI answer engines handle an estimated **12–18% of English informational queries** as of early 2026, up
from under 2% a year before. The curve is steep.

The strategic point: **LLMs cite 2–7 sources per answer. Google shows 10 blue links.** The competition
surface is dramatically smaller, and being one of 2–7 is achievable for a small site that does the
work. Users act on cited answers without clicking, so a citation is worth more than a ranking even
when it produces no traffic.

**Two different mechanisms, two different tactics:**

| Mechanism | Engines | How to win |
|---|---|---|
| **Retrieval at query time** | Perplexity, Google AI Overviews, ChatGPT Search | Be indexed, relevant, extractable. Fast to influence |
| **Training data** | ChatGPT, Claude, Gemini base models | Be published, indexed, and recognised as authoritative *before* the training cutoff. Slow, cumulative |

The second is why you start now even with no traffic. You're not writing for this quarter.

---

## The five pillars

In order of leverage for a product like ours:

### 1 — Extractable content structure

LLMs pull quotable, verifiable statements. Write for extraction:

| Non-extractable ❌ | Extractable ✅ |
|---|---|
| "Our platform is great for scaling teams" | "Postbliz runs six safety checks before every Reddit post: subreddit rules, karma minimum, account age, cooldown, self-promo ratio, and duplicate detection" |
| "Reddit can be tricky for marketers" | "Reddit's informal self-promotion norm is roughly 9 genuine contributions to 1 promotional post" |

**Tactics:** TL;DR at the top of every page · claims stated as complete sentences that stand alone
out of context · real data tables · Q&A sections using actual question phrasings · visible author,
publish date, and updated date.

### 2 — Third-party citation footprint

**The highest-leverage pillar for a new product**, and the one most people skip.

LLMs weight what *others* say about you far above what you say about yourself. Get mentioned on:

- **Reddit** — genuinely (and we're the tool that makes this safe, which is a nice symmetry)
- Directories: AlternativeTo, SaaSHub, Product Hunt, Indie Hackers, Uneed, Tiny Launch
- Comparison articles by others ("best post-bridge alternatives")
- Guest posts and founder bylines in indie-hacker publications
- GitHub — the public repo is itself a strong entity signal

### 3 — Entity authority

AI needs to resolve *who you are* unambiguously. Ambiguity means deprioritisation.

- Consistent name, description, and links everywhere — `sameAs` in Organization schema
- An `/about` page that plainly states what Postbliz is, who built it, and when it launched
- Crunchbase, LinkedIn company page, GitHub org — all consistent
- The founder as a named entity, connected to the product

### 4 — Schema markup

`Organization`, `SoftwareApplication`, `FAQPage`, `Article`, `BreadcrumbList`. Cheap, mechanical,
skipped by most competitors.

### 5 — Freshness

Update dates visible. Refresh top pages quarterly. Retrieval-based engines strongly prefer recent
content.

---

## `llms.txt`

Add `/llms.txt` — a markdown map of the site for LLM consumers. Adoption is uneven and it is **not** a
ranking factor, but it costs an hour and clarifies your entity for crawlers that do read it.

```markdown
# Postbliz

> Social publishing for indie SaaS founders. Generates posts that explain what you built,
> grounded in facts from your site and changelog. Includes a six-check Reddit safety gate.

## Docs
- [How grounded generation works](/how-it-works): every post traces to a real fact
- [Reddit safety checks](/reddit-safety): the six checks run before every Reddit post
- [Pricing](/pricing): plans from $19/mo

## Comparisons
- [vs post-bridge](/vs/post-bridge)
- [vs Postiz](/vs/postiz)
- [vs Buffer](/vs/buffer)
```

---

## Content plan

### Tier 1 — Ship with launch

| Page | Target query |
|---|---|
| `/` | brand |
| `/reddit-safety` | "how to promote on reddit without getting banned" |
| `/how-it-works` | "how does AI social media posting work" |
| `/pricing` | comparison shoppers |
| `/vs/post-bridge`, `/vs/postiz`, `/vs/buffer` | "X alternative" — high intent, low competition |

### Tier 2 — Weeks 1–12 after launch

**Reddit is our differentiated topic and where we can win outright:**

- "Subreddits that allow self-promotion (and their rules)" — **our proprietary data**
- "Reddit's 9:1 self-promotion rule, explained"
- "Why your Reddit posts get removed"
- "How to promote a SaaS on Reddit without getting banned"

**Plus:** "X API pricing in 2026, explained" (we have real numbers most people don't) ·
"Why AI-generated posts sound like AI" · "What to post when you have nothing to say"

### Tier 3 — Original research ⭐

**The single most citable asset type.** LLMs disproportionately cite original sources.

We accumulate data nobody else has: cached rules across hundreds of subreddits, which posts got held
and why, which subs are genuinely promo-friendly.

**"State of Self-Promotion on Reddit"** — annual, from aggregate anonymised data. Real numbers, real
methodology, freely available.

This is worth more than 50 blog posts. Do it as soon as you have enough data — around 100 customers.

### Programmatic SEO — after 20 customers, not before

Only with real data behind it. Thin programmatic pages are actively penalised.

- `/subreddits/{name}` — rules, karma requirements, promo stance, risk rating. Genuinely useful,
  built from data we already hold
- `/for/{category}` — "social media for indie SaaS founders" etc.

**Never generate pages with no substance.** One good page beats a hundred thin ones.

---

## Measuring GEO

Traditional analytics won't show it. Do this manually:

1. **Baseline now.** Write 30 queries our ICP would actually ask. Run each through ChatGPT, Claude,
   Perplexity, and Gemini. Record who gets cited.
2. **Re-run monthly.** Track the delta.
3. **Watch referrers** for `chat.openai.com`, `perplexity.ai`, `claude.ai` in PostHog.

**Baseline queries to track:**
- "how to promote my SaaS on reddit without getting banned"
- "best social media tool for indie hackers"
- "AI that writes posts about my product"
- "post-bridge alternative with reddit"
- "how to not sound like AI on twitter"

Gains typically appear around week 8–10 of consistent work and compound after.

---

## Realistic expectations

| Timeline | Expect |
|---|---|
| Months 1–3 | Nothing. Publishing into the void |
| Months 4–6 | First long-tail rankings. Occasional AI citation |
| Months 7–12 | 100–500 organic visits/mo. Reddit queries start landing |
| Year 2 | Compounding — if you kept publishing |

**This is not the channel that gets your first 100 customers.** [`GTM.md`](GTM.md) is. But it's the
channel that still works in year three when you're bored of posting on X.

## Related

- [`GTM.md`](GTM.md) · [`growth.md`](growth.md) · [`competitors.md`](competitors.md)
