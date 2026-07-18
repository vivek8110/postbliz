# Product Brief

## The problem

An indie founder ships something good and nobody hears about it. Not because they're lazy — because
marketing is a separate skill from building, and the blank posting box is genuinely hard. They don't
know *what* to post, *where* to post it, or *how often*. So they post nothing for three weeks, then
panic-post a launch announcement into a void.

The existing tools don't fix this. Schedulers (Buffer, post-bridge, Publer) assume you already know
what to write — they solve distribution, not the blank page. AI writers (Blaze, Marky, Apaya) solve
the blank page by generating marketing copy, which reads like marketing copy, which nobody engages
with and which increasingly gets flagged.

## The insight

Founders are bad at advertising and good at explaining. Ask a founder to write an ad and you get
something stilted. Ask them what they built this week and why it was hard, and you get something
genuinely interesting.

**So Postbliz doesn't write ads. It writes explanations.**

This one decision cascades into everything:

- Explanations need **facts**, so we ingest sources continuously instead of crawling once
- Explanations sound human, so they **don't trip AI detectors** or read as slop
- Explanations are what Reddit **allows**, which unlocks the platform everyone else avoids
- Explanations are what the founder would have written anyway, so they **approve them** instead of
  rewriting them

## The wedge

> It writes posts that explain what you built, the way you'd explain it to a friend — so they don't
> read as ads, don't read as AI, and don't get you banned from Reddit.

Three defensible pieces, in priority order:

1. **The grounding pipeline.** Every post traces to a real fact from a real source. This is what
   makes output feel human, and it's why we don't run dry in week three.
2. **Reddit done safely.** Six-check safety gate, subreddit rule awareness, recommendation engine.
   No mainstream scheduler does this because it's fiddly and the downside is scary. That's the moat.
3. **Agent-native distribution.** MCP server so the product is reachable from Claude Code and Cursor.
   Not a wedge — a *channel* to reach developers where they already work.

## What this is not

Say no to these. Repeatedly. They will all seem reasonable at some point.

| Not building | Why |
|---|---|
| Analytics dashboard | Native platforms do it better and free. We show clicks, that's it |
| DM / unified inbox | Different product, huge surface, no overlap with the wedge |
| Team seats, approvals, roles | Our user is one person. Revisit at 500 customers |
| White-label / agency mode | Different ICP with different needs and support load |
| Engagement pods, follow/unfollow, auto-DM | Account-risk features. Directly opposed to our positioning |
| Full video generation | A separate company. Users upload; we caption |
| Facebook, Pinterest, YouTube, Google Business | Not where our ICP's customers are |
| Being cheapest | post-bridge is $9. We can't win there and shouldn't try |

## Success criteria

**MVP is done when:** a stranger enters a URL, connects X + LinkedIn + Reddit, and 14 days of posts
publish on schedule with no ban and no manual intervention — **and they pay for month two.**

Month-two renewal is the only real signal. Signups prove the landing page worked. Renewal proves the
product did.

**Checkpoint at week 12** (not a kill date — a decision point):

| Signal | Read |
|---|---|
| 0 paying customers | Positioning is wrong. Talk to 20 users before writing more code |
| Paying but month-2 churn >60% | Content quality is the problem. Fix generation, not features |
| Paying, churn <40% | It works. Pour everything into distribution |

## Positioning

**Category:** not "social media management." That category is owned by Buffer and Hootsuite and
competes on price and platform count.

**Position as:** *the marketing co-founder for people who'd rather be building.*

**Against schedulers** (post-bridge, Buffer, Publer): they give you an empty calendar. We give you a
full one.

**Against AI writers** (Blaze, Marky, Apaya): they generate marketing copy from your homepage. We
generate explanations from what you actually shipped.

**Against Postiz:** they're infrastructure with 30 platforms and open-source credibility. We're
opinionated about *what* to post on five. Different job.

**Price above the bottom.** Competing on price against a $9 tool run by a solo founder with 1,400
customers is unwinnable. Charge more and be worth more.

## Related

- [`ICP.md`](ICP.md) — who exactly
- [`competitors.md`](competitors.md) — the full field
- [`mvp-scope.md`](mvp-scope.md) — what gets built first
- [`decisions.md`](decisions.md) — why these calls were made
