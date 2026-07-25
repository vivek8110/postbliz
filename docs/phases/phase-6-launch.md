# Phase 6 — Launch

**~28h · Week 10 · Prerequisite:** Phase 5 gate passed
**Read first:** [`GTM.md`](../product-information/GTM.md) ·
[`design.md`](../product-information/design.md) (landing brief) ·
[`open-source.md`](../product-information/open-source.md)

## Goal

Live, dogfooded, and in front of people. **Less code than any other phase, more discomfort.**

## Gate

- [ ] Landing page live, explains the product in 10 seconds
- [ ] Onboarding: URL → first post in under 60 seconds
- [ ] ToS and privacy policy published
- [ ] Self-host guide works — someone else could follow it
- [ ] **Dogfooded 2 full weeks**: Postbliz posting about Postbliz
- [ ] Launched to your own audience first
- [ ] First paying customer

---

## Task 6.1 — Onboarding polish · ~8h

**The highest-leverage UI in the product.** If the first generated post is bad, they close the tab and
never return. There is no second impression.

```
Read docs/product-information/design.md (onboarding brief),
growth.md (activation funnel), ICP.md.

Polish onboarding end to end.

Four steps: URL → live crawl → confirm brand profile → connect channels
→ first 3 posts.

1. Step 2 is the emotional peak. Show the work: pages found, facts
   extracted, a ticking counter, real facts appearing one by one. Do not
   hide it behind a spinner — the perceived effort is doing marketing
   for you.

2. TARGET: first previewable post in under 60 seconds. Measure it. This
   single number decides activation.

3. Thin-content path: if median specificity is low, prompt for a brain
   dump during onboarding rather than shipping mediocre posts.

4. Anti-ICP gate: if someone has no connectable accounts, say so plainly
   rather than letting them reach an empty queue.

5. Warmer copy than the rest of the app, but never salesy. This user is
   technical and suspicious of hype. Show the mechanism — that's what
   earns trust.

6. Every step instrumented in PostHog.

Then stop.
```

**Verify:** watch someone else do it without help. Time it. Note every hesitation — those are bugs.

---

## Task 6.2 — Landing page · ~8h

```
Read docs/product-information/design.md (landing brief), GTM.md (the
message), competitors.md.

Build the landing page. Use the brief in design.md.

Headline: "It writes posts that explain what you built."
Sub: "Not ads. Not AI slop. Not the thing that gets you banned from r/SaaS."

The hero is NOT a dashboard screenshot and NOT a gradient. Side-by-side:
generic AI marketing post in grey on the left, a Postbliz post on the
right — specific, first-person, with a real number — and the source fact
it came from shown beneath, linked. The contrast IS the pitch.

Then: how it works (URL → facts → posts) · the Reddit safety section
with all six checks listed · honest pricing · a founder note.

NO fake logos, NO invented testimonials, NO "trusted by thousands".
Say 12 customers when you have 12. Our ICP has finely-tuned detectors
and one exaggeration costs more than it earns.

Add /llms.txt and schema markup per seo-geo.md.

Then stop.
```

---

## Task 6.3 — Legal and docs · ~6h

```
Read docs/product-information/open-source.md and product-brief.md.

1. Terms of Service. Must include the account-outcome clause: platform
   bans and account actions are the user's responsibility. Have a
   template reviewed if you can afford it — this is the one place a
   template genuinely might not fit.

2. Privacy policy: what we store (OAuth tokens encrypted, hashed click
   data), what we don't (raw IPs, user agents), deletion on request.

3. docs/self-hosting/ — a guide that actually works. Include the honest
   costs: own PostPeer key, own Reddit app, own OpenRouter key,
   $20-60/month.

4. Rewrite README.md properly: what it is, screenshots, quickstart,
   the self-host cost note, contribution boundaries.

5. Verify LICENSE, CONTRIBUTING.md, SECURITY.md, CLA.md are all in place
   from Phase 0.

Then stop. Phase 6 code work is done.
```

---

## Task 6.4 — Dogfood for 2 weeks

**No code. The most important task in this phase.**

Set up Postbliz for Postbliz. Connect your real X, LinkedIn, and Reddit. Let it run for two full
weeks before you tell anyone.

**Why it can't be skipped:** you'll find bugs no test suite catches, you'll feel the content quality
as a user rather than a builder, and every post you publish is simultaneously a live demo and your
launch content.

**Track honestly:**
- How many posts did you edit? What's your own edit distance?
- Did anything get held? Was the reason clear?
- Did any channel die silently?
- Did you run out of material? (If yes, D7 was right — check your sources)
- Would you pay $19/month for this?

**That last question is the real gate.** If you wouldn't, iterate before launching. You know this
product better than anyone and your discomfort is data.

---

## Task 6.5 — Launch

Sequence from [`GTM.md`](../product-information/GTM.md). **Product Hunt is not first.**

### 1. X thread — your own audience
You've been building in public for 10 weeks. Tell the story: the problem, the X pricing discovery,
the Reddit rules, the moment output stopped sounding like AI. Ship the link.

### 2. Reddit — 2 days later
r/SaaS and r/indiehackers. A build story, not an ad. **Follow your own six checks, and say that you
did.** That's the proof.

### 3. Hacker News — Show HN
Lead with mechanism: grounded generation with provenance, and the Reddit rules engine. HN is hostile
to marketing and receptive to how things work.

### 4. Product Hunt — once you have testimonials
Tuesday–Thursday, 12:01am PT. 20 people lined up in advance. Reply to every comment personally.

### 5. Directories
Indie Hackers, Tiny Launch, BetaList, SaaSHub, AlternativeTo, Uneed. Low effort, useful backlinks,
feeds the GEO entity graph.

### The launch asset
Publish the numbers: *"10 weeks, $X, here's the architecture and what I got wrong."* Indie hackers
reward this enormously, and it's the most citable thing you can produce for AI answer engines.

---

## After launch — week 1

**Do not start building features.** Do this instead:

| Day | Do |
|---|---|
| Daily | Reply to every comment, DM, and email. Within hours |
| Daily | Watch the PostHog funnel. Where do people drop? |
| Daily | Read every generated post from every new user. Is quality holding? |
| Day 3 | Email everyone who signed up but didn't connect a channel. Ask why |
| Day 7 | Email everyone who connected but didn't publish. Ask why |

**The answers to "why" are worth more than any feature you could ship this week.**

---

## Troubleshooting

**Nobody signs up** — the landing message isn't landing. Show it to 5 people from the ICP and ask
what they think it does. If they can't tell you, rewrite.

**Signups don't connect channels** — OAuth friction, usually Instagram. Check the funnel; consider
letting people see generated posts before connecting anything.

**Connect but don't publish** — the generated posts aren't good enough. Back to Phase 2. This is R1
in the risk register and it's the one that kills products.

**Launch flops** — normal. Most launches do. The build-in-public audience matters more than any
single launch day. Keep posting.

**A customer gets banned** — respond publicly, fast, honestly. Explain what the checks do, what
happened, what changed. A well-handled incident is better marketing than no incident.

---

## Then: the week 12 checkpoint

Two weeks after launch, open
[`risk-register.md`](../product-information/risk-register.md#week-12-checkpoint) and read the table
honestly.

You'll have ten weeks of evenings sunk into this, and that sunk cost will argue loudly for continuing
regardless of what the data says. **That's exactly why the readings were written down in advance —
so the decision was made by someone with no skin in the game. Past you. Trust them.**
