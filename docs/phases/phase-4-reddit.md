# Phase 4 — Reddit

**~56h · Weeks 7–8 · Prerequisite:** Phase 3 gate passed, no double-post bugs
**Read first:** [`reddit-safety.md`](../product-information/reddit-safety.md) **in full** ·
[`platform-integrations.md`](../product-information/platform-integrations.md) (Reddit section)

## Goal

**The moat.** Reddit is where our ICP's customers are and the platform every mainstream scheduler
avoids because the downside is scary. Built direct, not through PostPeer.

## Gate

- [ ] Post to **5 real subreddits over 2 weeks — nothing removed**
- [ ] The ratio tracker correctly refuses an 11th promotional post after 10
- [ ] All six checks run on every publish, including after the first failure
- [ ] Cross-subreddit duplicate is blocked unconditionally
- [ ] A rules-fetch failure holds the post (fails closed)
- [ ] Held posts explain which check failed and what to do
- [ ] `grep -r "skipSafety\|bypassCheck\|forcePublish" .` returns **nothing**

## Not in this phase

No shadowban detection (V1.1). No comment monitoring. No Reddit DMs.

---

## Task 4.1 — Reddit OAuth and client · ~8h

```
Read docs/product-information/platform-integrations.md (Reddit section)
and data-model.md (channels).

Build the direct Reddit integration.

1. Register an OAuth app at reddit.com/prefs/apps, type "web app".
   Scopes: identity, submit, read, flair, mysubreddits.

2. lib/reddit/client.ts — Reddit requires a descriptive User-Agent that
   honestly identifies the app. Generic or misleading agents get blocked:
   web:com.postbliz.app:v1.0.0 (by /u/yourhandle)

3. OAuth flow. Access tokens last 1 hour, refresh tokens are permanent
   unless revoked — refresh aggressively.

4. Store tokens encrypted via lib/crypto.ts. Direct integration means we
   hold these ourselves, unlike the PostPeer platforms.

5. On connect, fetch and store redditKarma and redditAccountAgeDays.
   Refresh karma on every publish — stale karma defeats check 2.

6. Rate limit: 100 queries/minute. Build a simple limiter now rather
   than discovering the ceiling in production.

Do NOT publish anything yet. Then stop.
```

**Verify:** connect a real Reddit account, confirm karma and age are stored correctly.

---

## Task 4.2 — Subreddit metadata · ~8h

```
Read docs/product-information/reddit-safety.md (check 1) and
data-model.md (subreddit_targets).

Build subreddit metadata fetching.

1. Fetch /r/{sub}/about and /r/{sub}/about/rules.
2. Store in subreddit_targets: subscribers, rulesText, minKarma,
   minAccountAgeDays, requiresFlair, availableFlairs, cooldownDays.
3. Parse rules for self-promo restrictions —
   /no self.?promo|no advertis|no blogspam/i
4. Refresh when older than 7 days.
5. Handle: private sub, banned sub, nonexistent sub, quarantined sub.
   Each gets a clear message.
6. User can add a sub manually; rules fetched on add.

Then stop.
```

**Verify:** fetch r/SaaS, r/indiehackers, r/webdev. Confirm rules and flairs are captured.

---

## Task 4.3 — The six checks ⚠️ THE MOAT · ~16h

**All six. No bypass. Not "for testing" — use a throwaway account instead.**
See [`decisions.md`](../product-information/decisions.md) D4.

```
Read docs/product-information/reddit-safety.md IN FULL. Follow it exactly.

Build lib/reddit/safety-gate.ts with all six checks:

1. checkSubredditRules — LLM evaluation against cached rules (Rule Judge,
   agent 8 in app-agents.md). FAILS CLOSED: uncertain = fail. Rules fetch
   failure = hold, never publish blind. Plus hard signals: self-promo
   rules block link posts, required flair unset blocks.

2. checkKarmaMinimum — compare channels.redditKarma against the sub's
   minKarma. Default floor 50 where unknown.

3. checkAccountAge — default minimum 30 days. New accounts posting
   promotional content is the most-flagged pattern on the platform.

4. checkCooldown — default 7 days per sub, configurable up, never below 3.
   Plus a hard cap of 2 Reddit posts per day across ALL subs.

5. checkSelfPromoRatio — promotional posts / total over 30 days must stay
   under 0.2. Value-first posts always pass.

6. checkDuplicateContent — exact match plus embedding similarity > 0.8.
   Cross-subreddit duplicates blocked ALWAYS, regardless of elapsed time.
   No configuration on this one.

Requirements:
- Run all six even after the first failure. The user sees every problem
  at once, not one per attempt across six tries.
- Write every result to safety_checks, pass and fail alike.
- Every failure returns a plain-language userMessage and a suggestedFix.
- NO bypass flag anywhere in the codebase.

Tests for each check, passing and failing.

Then stop.
```

**Verify:** run the gate against a real draft. Deliberately trip each check individually and confirm
the message is genuinely helpful. Then:

```bash
grep -r "skipSafety\|bypassCheck\|forcePublish\|SKIP_SAFETY" . --exclude-dir=node_modules
```

Must return nothing.

---

## Task 4.4 — Reddit content generation · ~10h

**Independently conceived, never reformatted.** A reformatted X post gets removed as spam and can get
the account banned.

```
Read docs/product-information/reddit-safety.md (Reddit content is
different) and content-system.md (Reddit notes).

Build Reddit-specific generation.

1. A separate prompt in lib/agents/prompts/ — not a variant of the X or
   LinkedIn prompt. Different structure, different intent.

2. Structure: context -> what you tried -> what happened -> what you'd do
   differently -> optional single mention. No marketing voice anywhere.

3. THE TEST, encoded in the prompt: if every mention of the product were
   deleted, would the post still be worth reading? If no, regenerate.

4. Title carries most of the weight. Generate title and body separately.

5. Product mentioned once, late, or not at all.

6. Flair selection where the sub requires it.

Then stop.
```

**Verify:** generate 5 Reddit posts. Delete every product mention from each. Are they still worth
reading? If not, the prompt needs work.

---

## Task 4.5 — Publishing and held UX · ~10h

```
Read docs/product-information/reddit-safety.md (held-post UX) and
design.md (held banner, ratio meter).

Wire Reddit into publishing.

1. Extend trigger/publish-execute.ts: Reddit posts run the full safety
   gate before the platform call. Any failure = held, notify, stop.

2. Held UX per reddit-safety.md — which check, why, what to do, and
   three actions: reschedule, post elsewhere, edit.

3. Self-promo ratio meter in the UI, live. This is a trust feature, not
   a gauge — it's the visible artifact of what they're paying for.

4. Reddit posts appear on the Rail like any other, using the held-post
   break-alignment treatment from design.md.

5. Update subredditTargets.lastPostedAt on success.

Then stop.
```

**Verify:** schedule a Reddit post that will fail a check. Confirm the held banner explains it
clearly enough that a stranger would know what to do.

---

## Task 4.6 — Subreddit recommendation · ~4h

**Cut this if you're behind.** Users can type sub names manually.

```
Read docs/product-information/reddit-safety.md (subreddit
recommendation) and app-agents.md (agent 4).

Build the Sub Scout.

1. lib/agents/sub-scout.ts — brand profile in, 5-10 candidate subs out.
2. Each shows subscribers, self-promo stance, karma/age requirements,
   and a risk rating: green (promo tolerated), amber (value-first only),
   red (participate first, no promo).
3. NEVER auto-add a red sub. Show it, explain it, let them decide.
4. Seed list for our ICP: r/SaaS, r/indiehackers, r/microsaas,
   r/EntrepreneurRideAlong, r/SideProject, r/startups, r/webdev,
   r/selfhosted, plus the product's vertical sub.

Then stop. Phase 4 is complete after this.
```

---

## The two-week live test

**Do not skip this.** It's the only real gate.

1. Pick 5 subs relevant to a real project — mix green and amber
2. Schedule 2 weeks of Reddit posts through the full pipeline
3. Let it run. Don't intervene
4. Check every post daily: still up? Removed? Any mod message?

| Result | Read |
|---|---|
| All posts live | ✅ Gate passed |
| 1–2 removed | Investigate which rule. Tune that check |
| 3+ removed | Content quality or check tuning is wrong. **Fix before launch** |
| Account actioned | **Stop.** Something is fundamentally wrong. Do not ship |
| 0% held over 2 weeks | The gate isn't working. Expect 10–30% held |

That last row matters — a gate that never fires isn't protecting anyone.

---

## Troubleshooting

**Reddit 403 on every request** — almost always the User-Agent. It must be descriptive and honest.

**Rules parsing misses obvious restrictions** — rules are freeform text and wildly inconsistent. That's
why check 1 uses an LLM. Make sure it fails closed on ambiguity.

**Everything gets held** — check your defaults. A fresh test account with 12 karma will legitimately
fail checks 2 and 3. That's correct behaviour, not a bug.

**Posts removed despite passing** — the content is too promotional. Apply the deletion test from Task
4.4 more strictly.

**Ratio calculation seems wrong** — verify what counts as promotional. A post with no link and one
late mention should count as value-first.

---

## Gate passed?

Tick the boxes, complete the two-week live test. Then → **[Phase 5](phase-5-money.md)**.

**This is the phase where shipping something half-working does real damage to real people's accounts.
If the live test goes badly, fix it — don't ship it and hope.**
