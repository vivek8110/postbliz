# Phase 5 — Money and Proof

**~28h · Week 9 · Prerequisite:** Phase 4 gate passed
**Read first:** [`pricing-and-unit-economics.md`](../product-information/pricing-and-unit-economics.md) ·
[`features.md`](../product-information/features.md) (F11–F14)

## Goal

People can pay you, limits actually bite, and users can see the product working. Without this you
have a demo.

## Gate

- [ ] Pay yourself with a real card, end to end
- [ ] Limits enforced server-side — try to exceed them and fail
- [ ] Trial stops at exactly 10 posts across all platforms
- [ ] Short links redirect and record clicks
- [ ] Weekly digest arrives and is accurate
- [ ] Dashboard shows three numbers and nothing else

## Not in this phase

No coupons, no affiliates, no annual billing (add after first customers), no engagement analytics.

---

## Task 5.1 — Dodo Payments · ~10h

Budget **~6% effective**, not the 4% headline — subscriptions add 0.5%, international cards add 1.5%.

```
Read docs/product-information/pricing-and-unit-economics.md (plans,
payment fees) and features.md (F11).

Integrate Dodo Payments.

1. Three products: Solo $19, Pro $49, Studio $99. USD only, no INR.
2. Checkout flow from the settings page.
3. Webhook handler at app/api/webhooks/dodo — VERIFY THE SIGNATURE,
   reject unsigned. Handler must be idempotent; webhooks retry and will
   arrive twice.
4. Map events to subscriptions: created, updated, cancelled, payment
   failed.
5. Customer portal link for self-serve management.
6. Failed payment: grace period, then pause the queue. Never delete
   anything.
7. Downgrade: pause excess channels, don't delete them.

Then stop.
```

**Verify:** subscribe with a real card. Cancel. Confirm state updates. Replay a webhook and confirm
nothing duplicates.

---

## Task 5.2 — Plan limits and trial · ~6h

```
Read docs/product-information/pricing-and-unit-economics.md (plan table)
and data-model.md (usage_counters, subscriptions).

Enforce limits SERVER-SIDE. Client-side checks are UX, not enforcement.

1. Per-plan caps: projects, channels, posts/month, sources.
2. Trial: 10 posts TOTAL across all platforms and channels. One counter,
   incremented on every publish. Not 10 per platform.
3. No card on trial.
4. Hitting the trial cap shows an upgrade prompt, not an error.
5. Monthly usage rolls over on the billing period boundary.
6. Usage visible in settings against plan limits.
7. Reddit safety is available on EVERY plan including trial. It's the
   moat — paywalling it means most users never see what makes us
   different.

Then stop.
```

**Verify:** on a trial account, publish 10 posts. The 11th must be blocked with an upgrade prompt.
Try exceeding channel limits via the API directly, not just the UI.

---

## Task 5.3 — Short links and attribution · ~6h

**Cut this if you're behind** — but it's the only proof of value users get, so cut it last.

```
Read docs/product-information/data-model.md (links, link_clicks) and
features.md (F12).

Build link tracking.

1. Short links on our own domain, one per scheduled post.
2. Edge redirect — fast. Record the click.
3. Store country, referrer, hashed user agent. NEVER raw IPs or raw
   user agents. Public repo, third-party visitor traffic, keep the
   GDPR surface at zero.
4. Click counts per post, per channel, per week.
5. Per-project toggle to disable short links — some founders prefer
   clean URLs.
6. Substitute the short link at publish time, not at draft time, so the
   user sees their real URL while editing.

Then stop.
```

**Verify:** publish a post with a link, click it, confirm the count increments and no PII is stored.

---

## Task 5.4 — Digest and nudges · ~4h

The retention mechanic. See [`growth.md`](../product-information/growth.md).

```
Read docs/product-information/growth.md (retention) and features.md (F13).

Build email.

1. Weekly digest via Resend: what published, what's queued, clicks,
   what needs review. Short and plain — no marketing voice.
2. Re-auth email fires the MOMENT a channel becomes unhealthy, not on a
   schedule. A silently dead channel is how you lose someone without
   ever hearing from them.
3. Autopilot OFF + unreviewed at fire time -> hold and nudge. Never
   publish on their behalf.
4. Autopilot ON + unreviewed -> publish (they opted in), and say so in
   the digest.
5. Working unsubscribe. Keep transactional and marketing separate.
6. The Friday "what did you ship?" email from Phase 1 should already
   exist — verify it's live.

Then stop.
```

**Verify:** trigger each email to yourself. Read them as a customer would.

---

## Task 5.5 — Dashboard · ~2h

Deliberately tiny. Resist every urge to add more.

```
Read docs/product-information/features.md (F14) and design.md.

Build the dashboard. Three numbers:
- Posts published this week
- Clicks to your site this week
- Items needing review, linked to the queue

Nothing else. No engagement graphs, no follower charts, no vanity
metrics. Native platforms do analytics better and free — we said no to
this in product-brief.md.

Then stop. Phase 5 is complete after this.
```

---

## Before Phase 6 — instrument the funnel

You cannot fix what you can't see, and post-launch is too late to start measuring.

Confirm these fire in PostHog, per [`growth.md`](../product-information/growth.md):

```
signup → url_entered → crawl_completed → first_post_generated
→ channel_connected → first_post_published → week_2_return
```

Plus: `edit_distance` per post · `slop_score` per draft · `reddit_post_held` with the check name ·
`llm_cost` per project.

---

## Troubleshooting

**Webhook signature fails** — you're verifying against the parsed body instead of the raw one. Next.js
route handlers need the raw text before JSON parsing.

**Subscription state drifts** — webhooks arrive out of order. Use the event timestamp, not arrival
order, and make handlers idempotent.

**Limits bypassed** — you enforced client-side only. Every check belongs in the server action or
route handler.

**Trial counter wrong** — confirm it counts publishes, not drafts, and counts across all channels
rather than per channel.

**Emails to spam** — verify your Resend domain with SPF, DKIM, DMARC. Do this early; propagation
takes time.

---

## Gate passed?

Tick the boxes. Then → **[Phase 6](phase-6-launch.md)**.

**Charge yourself real money before launch.** A failed first payment from a real customer is a
terrible way to discover a webhook bug.
