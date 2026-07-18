# Go To Market

**The unfair advantage:** we're building a product that writes build-in-public posts, for people who
build in public. **Dogfooding is the launch strategy.** Every post about Postbliz should be written
by Postbliz, and we should say so.

---

## The message

**Headline:** *It writes posts that explain what you built.*
**Sub:** Not ads. Not AI slop. Not the thing that gets you banned from r/SaaS.

### Hero: the contrast, not a screenshot

Two posts side by side. Left: generic AI marketing copy, grey, visibly hollow. Right: a Postbliz
post — specific, first-person, with a real number — and beneath it, **the source fact it came from**,
linked. The contrast *is* the pitch. See [`design.md`](design.md).

### What we say

| We say | Not |
|---|---|
| "Explains what you built" | "AI-powered content creation" |
| "Every post comes from something real" | "Advanced AI writing" |
| "Won't get you banned from Reddit" | "Multi-platform publishing" |
| "Your changelog becomes your marketing" | "Save 10 hours a week" |
| "12 people use it" | "Trusted by thousands" |

Never inflate numbers. Our ICP has finely-tuned detectors for this and one exaggeration costs more
than it earns.

---

## Phase 1 — Build in public (start now, before launch)

Start **week 1 of building**, not at launch. The audience has to exist before the product does.

**On X:** post the build. The X pay-per-use pricing discovery. The 50-credit link surcharge and what
it forced. Why Reddit needed six checks. The 30-facts-then-it-runs-dry problem. Screenshots of real
generated posts, including bad ones.

**Why this works:** these are genuinely interesting engineering problems, and posting them *is* the
product's thesis demonstrated. Every post proves the pitch.

**On Reddit:** r/SaaS, r/indiehackers, r/SideProject. Value-first, per our own rules. A post titled
*"I read 200 subreddit rulesets so you don't have to — here's what I learned about self-promo rules"*
earns attention and demonstrates the moat simultaneously.

**Target before launch:** 300–500 relevant X followers, 3–5 well-received Reddit posts, and 20 people
who've said "tell me when it's ready."

---

## Phase 2 — Private beta (week 8–10)

**10–15 people.** Hand-picked from replies and DMs. Free for 3 months in exchange for real feedback.

Pick people who: have a live product, post inconsistently already, and will actually tell you when
output is bad. Avoid people who'll be polite.

**Ask exactly one question each week:** *"Which posts did you edit, and why?"* Edit-distance data plus
the reason behind it is worth more than any survey.

**Gate to public launch:** 5 users publishing weekly without prompting.

---

## Phase 3 — Launch (week 10–12)

**Sequence matters.** Product Hunt is not first.

**1. X thread first.** Your own audience, warmed for 10 weeks. Tell the story: the problem, the X
pricing discovery, the Reddit rules, the moment output stopped sounding like AI. Ship the link.

**2. Reddit, 2 days later.** r/SaaS and r/indiehackers. A build story, not an ad. Follow our own six
checks — and *say* that you did. Meta-proof.

**3. Hacker News Show HN.** The technical angle: grounded generation with provenance, and the Reddit
rules engine. HN is hostile to marketing and receptive to mechanism. Lead with mechanism.

**4. Product Hunt.** Once the first three have produced testimonials. Tuesday–Thursday, 12:01am PT.
Have 20 people lined up in advance. Reply to every comment personally.

**5. Directories:** Indie Hackers, Tiny Launch, BetaList, SaaSHub, AlternativeTo, Uneed. Low effort,
useful backlinks, and they feed the GEO entity graph — see [`seo-geo.md`](seo-geo.md).

### The launch asset

Publish the numbers. *"I spent 10 weeks and $312 building this. Here's the cost breakdown, the
architecture, and what I got wrong."* Indie hackers reward this enormously, it's genuinely useful,
and it's the most citable thing you can produce for AI answer engines.

---

## First 100 customers

| Channel | Expect | Effort |
|---|---|---|
| Build-in-public on X | 20–30 | High, ongoing, compounding |
| Reddit (value-first) | 15–25 | Medium — and we're the safest tool to do it with |
| Product Hunt | 10–20 | One-off spike, mostly tyre-kickers |
| Hacker News | 5–15 | Volatile. All or nothing |
| Directories | 5–10 | Low, one-time |
| **Open source / GitHub** | **10–20** | Free distribution. See [`open-source.md`](open-source.md) |
| Word of mouth | 10–20 | Only if retention is real |
| SEO/GEO | 0–5 in year 1 | Slow. Start now, harvest later |

**No paid acquisition.** At $19–49/mo with an unproven funnel, paid ads burn cash you don't have.

---

## Objection handling

| They say | Answer |
|---|---|
| "Post-bridge is $9" | Different product. They schedule what you write. We write it. And they have no Reddit |
| "AI posts sound like AI" | Ours are grounded in your actual facts. Here's a side-by-side. *Show, don't argue* |
| "I'll get banned from Reddit" | Six checks before every post. Here's the list. That's the whole reason we exist |
| "I can just use ChatGPT" | ChatGPT doesn't know what you shipped this week, doesn't know r/SaaS's rules, and doesn't publish at 9am Tuesday |
| "Will it sound like me?" | It samples your last 20 posts once and writes from that. Then you edit anything you don't like |

---

## Anti-patterns

- **No cold DMs.** Our ICP despises them and will post screenshots
- **No fake urgency.** No countdown timers, no "only 3 spots left"
- **No inflated numbers.** Say 12 customers when you have 12
- **No engagement bait.** We sell the opposite of that
- **Don't launch on Product Hunt first.** Launch to your own audience first, PH once you have proof

## Related

- [`ICP.md`](ICP.md) — who and where
- [`growth.md`](growth.md) — loops after launch
- [`seo-geo.md`](seo-geo.md) — the slow compounding channel
