# Open Source

**Decision: fully open source, Postiz-style.** Everything public including the Reddit safety engine
and the prompts.

This is a real commitment with real consequences. This doc makes them explicit so nobody is surprised
later.

---

## Why

**Distribution.** GitHub is a discovery channel our ICP actually uses. Postiz reached $1.3M ARR with
an open repo. Trending on GitHub reaches more indie hackers than any ad we could afford.

**Trust.** We're asking people to hand us OAuth tokens for accounts that represent their livelihood.
"Read the code" is the strongest possible answer to "is this safe?"

**Credibility.** Our ICP *is* developers. An open repo speaks to them in a way marketing copy can't.

**Contributions.** New platform integrations and bug fixes from people who need them.

---

## What we give up — honestly

**The Reddit safety engine is public.** It's the moat, and a competitor can read all six checks in an
afternoon.

This is survivable, and here's why: **the checks aren't secret, they're tedious.** Anyone determined
could reverse-engineer them from behaviour. What's actually defensible is the accumulated subreddit
rules data, the tuning from real held posts, and being *known* as the Reddit-safe tool. Execution and
reputation, not source code.

The genuinely defensible parts remain private by nature:
- Cached subreddit rules and behavioural data (in our DB, not the repo)
- Prompt tuning informed by real edit-distance data
- The customer relationship

**The prompts are public.** Anyone can copy them. But prompts without our knowledge pipeline produce
generic output — the prompts aren't the magic, the grounding is.

**Accept this and move on.** Don't half-open it; a repo missing its interesting parts gets no stars
and earns no trust. You get one shot at the credibility, and hedging wastes it.

> **You can always open more. You can never un-open.** Since we're going fully open, be deliberate
> about the license — that's the one lever that remains.

---

## License: AGPL-3.0

Same as Postiz, and for the same reason.

**AGPL requires** anyone running modified code as a network service to publish their modifications.
This prevents the specific bad outcome: a well-funded competitor forking Postbliz, adding polish, and
running it as a closed SaaS.

**It permits** self-hosting, personal and internal commercial use, and contribution. Everything we
actually want.

Add a CLA so we retain the option to dual-license or relicense later. Contributors sign once; it
costs them nothing and keeps our options open.

```
LICENSE          AGPL-3.0
CLA.md           contributor license agreement
NOTICE           attribution requirements
```

---

## Repo structure

```
postbliz/
├── CLAUDE.md
├── LICENSE                    AGPL-3.0
├── README.md                  what it is, screenshots, self-host quickstart
├── CONTRIBUTING.md
├── SECURITY.md                responsible disclosure — matters, we hold tokens
├── .env.example               every var, no values
├── docker-compose.yml         one-command self-host
├── docs/
│   ├── product-information/   these docs
│   └── self-hosting/
├── app/
├── lib/
│   ├── agents/                prompts live here, public
│   ├── platforms/
│   └── reddit/                the safety engine, public
├── db/                        schema + queries (root, not under lib/)
├── trigger/
└── components/
```

**Nothing in the repo is private.** No internal notes, no customer data, no "TODO: hack for
$BIGCUSTOMER". Write every commit assuming a stranger reads it — because one will.

---

## Self-hosting

**Be honest in the README about what self-hosting requires**, or you'll drown in issues from people
who expected it to just work:

| Need | Why |
|---|---|
| Own PostPeer API key | Publishing for X/LinkedIn/IG/TikTok. Their pricing, their terms |
| Own Reddit OAuth app | 10 minutes, free |
| Own OpenRouter key | LLM calls cost money. This is the real ongoing expense |
| Own Firecrawl key | Or swap in another crawler |
| Postgres + Redis | Docker compose provides both |
| Own Trigger.dev | Or self-host it |

**State clearly:** self-hosting is free of *our* charge but not free of cost — expect $20–60/month in
API keys depending on volume. Setting this expectation up front saves enormous support load.

### The cloud pitch

| | Self-host | Cloud |
|---|---|---|
| Cost | $20–60/mo in your own API keys | From $19/mo, all-in |
| Setup | ~1 hour + ongoing maintenance | 2 minutes |
| Updates | You pull and migrate | Automatic |
| Support | GitHub issues, best effort | Email, from a human |
| Reddit rules data | You start empty | Ours, pre-cached and maintained |

**The last row is the strongest argument** and it's a genuine, structural advantage — our subreddit
rules cache improves with every customer and can't be forked.

---

## Boundaries

Set expectations in `CONTRIBUTING.md` on day one:

**Welcome:** bug fixes, new platform integrations, docs, translations, self-hosting improvements,
tests.

**Discuss first:** anything touching the safety gate, the generation pipeline, or the data model.

**Won't merge:** features that increase account risk (engagement automation, bulk cross-posting,
follow/unfollow), anything that removes or weakens a safety check, or anything that meaningfully
expands scope. Our narrowness is the product.

**Support policy — state it plainly:** GitHub issues are best-effort for a solo maintainer with a
full-time job. Paying customers get email support. This is not rude; it's honest, and it's what keeps
the project alive.

---

## Practical hygiene

- **Secret scanning from commit one.** `gitleaks` in pre-commit and CI. One leaked key in a public
  repo is a very bad day
- **Dependabot on.** Public repos get scanned by everyone, including people looking for CVEs
- `SECURITY.md` with a disclosure email. Respond fast — you hold OAuth tokens
- Never commit real data, even in tests or fixtures
- Squash merge. Keep history clean and readable

---

## What "good" looks like at 6 months

- Clear README with screenshots and a working one-command demo
- 200+ stars (achievable with a decent HN or Reddit post)
- 3–5 external contributors
- Self-hosters filing bugs you'd never have found
- At least one "I self-hosted this then just paid for the cloud version" post

That last one is the whole strategy working.

## Related

- [`competitors.md`](competitors.md) — Postiz, our open-source neighbour
- [`GTM.md`](GTM.md) — GitHub as a channel
- [`decisions.md`](decisions.md) — the record of this call
