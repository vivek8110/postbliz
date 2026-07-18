# Ideal Customer Profile

## Primary ICP

**The indie SaaS founder who ships more than they market.**

| Attribute | Value |
|---|---|
| Role | Solo founder or technical co-founder |
| Product | SaaS, dev tool, AI wrapper, micro-SaaS, Chrome extension, mobile app |
| Stage | Launched, has a live URL, $0–20k MRR |
| Team | 1–3 people, no marketer |
| Existing accounts | **Has** X and LinkedIn already. May lurk on Reddit |
| Audience | Small. 200–5,000 followers. Not zero, not famous |
| Technical | Yes. Ships their own code. Lives in a terminal |
| Buys | $19–79/mo tools on their own card, no approval needed |
| Discovers tools via | X, Reddit, Hacker News, Product Hunt, YouTube, Claude/ChatGPT |
| Timezone | Global, English-speaking. US + EU + India heavy |

### What they say

> "I know I should be posting but I don't know what to say."
> "I posted once and got 4 likes so I stopped."
> "I tried Buffer but the calendar was just empty and staring at me."
> "I don't want to sound like a LinkedIn influencer."
> "I'd try Reddit but I'd probably get banned."

### What they actually want

Not "save time." They have time — they have a whole evening they'll spend refactoring something that
didn't need it. They want **to not feel bad about marketing.** The emotional job is removing the
guilt of an empty feed and the anxiety of writing something cringe.

This is why the review step matters more than the automation. Approving a post that already sounds
like them feels good. Being handed 30 generated posts to fix feels like homework.

### Where they hang out

- **X** — `#buildinpublic`, indie hacker circles, replies under bigger accounts
- **Reddit** — r/SaaS, r/indiehackers, r/microsaas, r/EntrepreneurRideAlong, r/SideProject,
  plus their product's vertical sub
- **Communities** — Indie Hackers, WIP, Product Hunt, small Discords
- **YouTube** — build-in-public channels, "I built X in a weekend" content

## Secondary ICPs (do not optimise for these yet)

**Solo consultant / agency of one.** Promotes services rather than a product. Same posting anxiety,
different content shape. Works with our model but the site crawl yields less. Revisit post-MVP.

**Non-technical SMB owner** (café, gym, clinic). Much larger market, but needs images and video first,
IG/TikTok first, and far more hand-holding. A different product. Explicitly deferred.

**Creator / personal brand.** Wants growth tactics and engagement features we've said no to.
Not our user.

## Anti-ICP — actively unqualified

| Who | Why not |
|---|---|
| Pre-launch, no live URL | Nothing to crawl. Product literally cannot work |
| Zero social accounts | Posts go to nobody, they see no result, they churn in week 2 |
| Agencies managing 20 clients | Needs seats, approvals, white-label. Different product |
| Anyone wanting follower growth hacks | We refuse those features. Bad fit, will churn angry |
| Enterprise / regulated | Needs SSO, audit logs, legal review. Not for years |

**Gate this in onboarding.** If someone has no connected accounts after the URL step, say so plainly
rather than letting them reach an empty queue.

## Jobs to be done

Ranked by how much they'd pay to solve it:

1. **"Tell me what to post."** The blank page. Highest value, least served by existing tools.
2. **"Make it sound like me, not like AI."** Their reputation is on the line with every post.
3. **"Keep me consistent without me thinking about it."** The scheduling job. Table stakes.
4. **"Let me use Reddit without getting banned."** High value, currently unserved, narrow audience.
5. **"Show me it's working."** Not for the dashboard — so they can justify renewing.

## Buying behaviour

- Decides in **one session**. Will not book a demo. Will not read a case study.
- Trial length matters less than **time-to-first-good-post**. If the first generated post is bad,
  they close the tab and never return. There is no second impression.
- Compares against **doing nothing** more often than against competitors.
- Churns silently. No exit interview. Watch for the pattern: connect → generate → never return.

### Implications for the product

| Because | We must |
|---|---|
| First post decides everything | Spend disproportionate effort on the onboarding generation. Slower and better beats faster and generic |
| They're technical | Don't dumb down the UI. Show the mechanism. Show why a post was held |
| They fear cringe | Always preview. Always editable. Never auto-post something they haven't seen at least once |
| They compare to nothing | Sell against inertia, not features. "Your last post was 6 weeks ago" |
| They churn silently | Instrument the funnel obsessively in PostHog. The drop-off *is* the feedback |

## Sizing (rough)

Not a market that needs a TAM slide, but for sanity: Indie Hackers, r/SaaS, and `#buildinpublic`
overlap into roughly 200k–500k people globally who've launched something and have a URL. Maybe 10%
would pay for marketing help. At $29/mo, capturing 0.1% of that serviceable slice is ~$70k ARR.

That's a good solo business and a bad venture business. Build accordingly — no burn, no hiring,
profitable at 50 customers.

## Related

- [`product-brief.md`](product-brief.md) — the wedge
- [`GTM.md`](GTM.md) — how to reach these people
- [`design.md`](design.md) — designing for a technical, cringe-averse user
