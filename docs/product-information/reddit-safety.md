# Reddit Safety

**Mandatory reading before any Reddit code.**

## Why this exists

Reddit is the platform where our ICP's customers actually are, and the platform every mainstream
scheduler avoids because the downside is scary. That asymmetry is the moat.

It's scary for good reason. Reddit flags accounts posting at unnatural intervals, using identical
titles across subreddits, or showing bot-like patterns, and moderators have broad, fast, unappealable
enforcement powers. A naive "schedule 3 Reddit posts a week" feature will get customers shadowbanned.

A banned customer is not one churned subscription. It's a churned subscription plus a public post
titled *"Don't use Postbliz, it got my account banned"* in the exact subreddit where our other
customers are reading.

**Liability position:** the ToS places account outcomes on the user. That's the legal answer. It is
not the product answer. Build the checks anyway — reputational damage doesn't read the ToS.

---

## The six checks

Every Reddit publish runs all six. There is no bypass flag. Do not add one, including "for testing" —
use a throwaway account instead.

Results are written to `safety_checks` for every attempt, pass or fail. That table is both the audit
trail and the source of the user-facing explanation.

### 1 — Subreddit rules

Fetch `/r/{sub}/about/rules` and cache in `subreddit_targets.rulesText`. Refresh if older than 7 days.

Parse for restrictions and evaluate the draft against them with an LLM call:

```
Given these subreddit rules and this draft post, does the post violate any rule?
Be strict. When uncertain, fail the check.
Return: { passes, violatedRules: [{ rule, why }], suggestedFix }
```

Also check hard signals:
- Rules text matching `/no self.?promo|no advertis|no blogspam/i` → block any post containing a link
- Required flair unset → block
- Post-type restrictions (text-only subs receiving a link post) → block

**Fail closed.** If the rules fetch fails, hold the post. Do not publish blind.

### 2 — Karma minimum

Many subs enforce a karma floor, sometimes undocumented. Compare `channels.redditKarma` against
`subredditTargets.minKarma` where known, with a **default floor of 50 combined karma** for any sub
where we don't know.

Below the floor → hold, and tell the user plainly: their post would be auto-removed, and the fix is
to comment genuinely in that sub for a week first.

Refresh karma on every publish (`/api/v1/me` is cheap, and stale karma defeats the check).

### 3 — Account age

Default minimum **30 days**. Many subs silently filter newer accounts. Below the threshold → hold
with an explanation.

New Reddit accounts posting promotional content are the single most-flagged pattern on the platform.
Refusing to help someone do it is the correct behaviour even though it's the less convenient one.

### 4 — Per-subreddit cooldown

Default **7 days** between posts to the same subreddit, configurable up per sub but never down below
3 days.

Check `subredditTargets.lastPostedAt`. Within cooldown → hold and offer to reschedule to the next
eligible date rather than just refusing.

Also: **maximum 2 Reddit posts per day across all subreddits**, per account. Higher volume is a
sitewide spam signal regardless of individual sub compliance.

### 5 — Self-promotion ratio

Reddit's cultural norm — enforced by mods, and formalised in many sub rules — is roughly **9 pieces
of genuine participation to 1 self-promotional post.**

We can't force people to comment, but we can enforce our side:

- Count posts in the last 30 days per account: how many contained a link or product mention
- If promotional posts / total posts > **0.2**, hold further promotional posts
- Value-first posts (no link, product mentioned once or not at all) always pass this check

**Show the ratio in the UI as a live counter.** This is a trust feature, not just a guard — it teaches
the user how Reddit works and it's the visible artifact of the thing they're paying for.

### 6 — Duplicate content

Hard block, at the DB level, no override.

- Exact-match check on title and body against everything this project has posted to Reddit
- Embedding similarity > **0.8** against any prior Reddit post → block
- **Cross-subreddit duplicate → always block**, regardless of time elapsed

Posting the same content to multiple subreddits is the single clearest spam signal on the platform
and the fastest route to a sitewide ban. This check has no configuration.

---

## Implementation

```ts
// lib/reddit/safety-gate.ts
type CheckResult = {
  name: string;
  passed: boolean;
  detail: string;
  userMessage?: string;   // plain language, shown in the UI
  suggestedFix?: string;
};

export async function runSafetyGate(
  post: ScheduledPost, draft: Draft, channel: Channel, sub: SubredditTarget,
): Promise<{ passed: boolean; checks: CheckResult[] }> {
  const checks = await Promise.all([
    checkSubredditRules(draft, sub),
    checkKarmaMinimum(channel, sub),
    checkAccountAge(channel, sub),
    checkCooldown(channel, sub),
    checkSelfPromoRatio(channel, draft),
    checkDuplicateContent(draft, post.projectId),
  ]);

  await db.insert(safetyChecks).values(
    checks.map(c => ({ scheduledPostId: post.id, userId: post.userId,
                       checkName: c.name, passed: c.passed, detail: c.detail })),
  );

  return { passed: checks.every(c => c.passed), checks };
}
```

Run all six even after the first failure — the user should see every problem at once, not fix them
one at a time across six attempts.

---

## Held-post UX

When a post is held, the user sees exactly what happened and what to do. Never a generic error.

> **Held — r/SaaS**
> Your Reddit account has 34 karma. r/SaaS filters posts from accounts under 50.
>
> **What to do:** comment on a few threads in r/SaaS this week. We'll check again automatically
> before the next scheduled slot.
>
> *[Reschedule for next week]  [Post somewhere else]  [Edit]*

This moment is the product demonstrating its value most clearly. Design it properly — see
[`design.md`](design.md).

---

## Reddit content is different

Reddit content is **independently conceived**, never a reformatted X or LinkedIn post. Different
prompt, different structure, different intent.

**Test:** if you deleted every mention of the product, would the post still be worth reading? If no,
it will be removed as spam and it deserves to be.

| Wrong ❌ | Right ✅ |
|---|---|
| "Check out my new tool for UGC videos!" | "Spent 3 weeks trying to batch-render 40 videos. Here's what broke and how I fixed it." |
| Title: "Postbliz — AI social media" | Title: "What I learned reading 200 subreddit rulesets" |
| Link in body, product in first line | Product mentioned once at the end, or in a comment |

**Structure:** context → what you tried → what happened → what you'd do differently → optional single
mention. Marketing voice absent everywhere.

---

## Subreddit recommendation

We recommend subs; the user confirms. From the brand profile, suggest 5–10 relevant subreddits with:

- Subscriber count and typical post volume
- A plain-language summary of their self-promo stance
- Karma and account-age requirements where known
- A **risk rating**: green (promo tolerated) / amber (value-first only) / red (no promo, participate
  first)

Never auto-add a red sub. Show it, explain it, let them decide.

Seed list for our ICP: r/SaaS, r/indiehackers, r/microsaas, r/EntrepreneurRideAlong, r/SideProject,
r/startups, r/webdev, r/selfhosted, plus the product's vertical sub.

---

## V1.1 — shadowban detection

Fetch the post's permalink logged-out ~30 min after publishing. If it 404s or shows as removed, the
account is likely shadowbanned or the post was auto-filtered. Alert the user and pause Reddit posting
for that project until they confirm it's resolved.

Cheap to build, and it's the feature that turns "we tried to keep you safe" into "we caught it."

## Related

- [`platform-integrations.md`](platform-integrations.md) — Reddit API setup
- [`content-system.md`](content-system.md) — generation
- [`product-brief.md`](product-brief.md) — why this is the moat
