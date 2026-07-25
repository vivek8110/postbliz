# Phase 3 — Scheduling and Publishing

**~56h · Weeks 5–6 · Prerequisite:** Phase 2 gate passed
**Read first:** [`platform-integrations.md`](../product-information/platform-integrations.md) ·
[`tech-architecture.md`](../product-information/tech-architecture.md) (publishing flow) ·
[`pricing-and-unit-economics.md`](../product-information/pricing-and-unit-economics.md)

## Goal

Posts reach real accounts, on schedule, without you watching. The critical path — this is the code
that runs unattended against other people's audiences.

## Gate

- [ ] 14 days of posts publish to real X and LinkedIn accounts unattended
- [ ] **Killing the worker mid-publish and retrying does not double-post**
- [ ] Every X post with a link publishes the link as a reply, never in the body
- [ ] A permanent failure holds with a plain-language reason, not a stack trace
- [ ] Token refresh works — force an expiry and watch it recover
- [ ] Instagram and TikTok publish with uploaded media

## Not in this phase

No Reddit. It's built direct, has its own safety gate, and gets Phase 4 to itself.

---

## Task 3.1 — PostPeer adapter · ~8h

**Wrap it properly.** If PostPeer raises prices, breaks, or disappears, you swap an adapter — not the
app. See [`risk-register.md`](../product-information/risk-register.md) R5.

```
Read docs/product-information/platform-integrations.md (PostPeer layer,
X, LinkedIn, Instagram, TikTok) and pricing-and-unit-economics.md.

Build the PostPeer adapter.

1. lib/platforms/types.ts — our own interface. PublishResult as the
   discriminated union from platform-integrations.md:
   ok | transient failure | permanent failure.

2. lib/platforms/postpeer.ts — the ONLY file importing PostPeer. Never
   import their SDK anywhere else.

3. Map their errors to our transient/permanent classification.
   429/5xx/network = transient. Auth/validation/policy/duplicate =
   permanent.

4. Record credits consumed per publish to usage_counters. Their credit
   map is in pricing-and-unit-economics.md — X without a link is 5,
   X with a link is 50.

5. Never let a raw platform error string reach a user. Translate every one.

Sandbox first — do not publish to real accounts yet. Then stop.
```

**Verify:** publish to their sandbox. Force a failure and confirm the classification is right.

---

## Task 3.2 — X link handling ⚠️ HARD RULE 1 · ~4h

Small task, outsized impact. **$63/mo vs $630/mo at 100 customers.** See
[`decisions.md`](../product-information/decisions.md) D3.

```
Read docs/product-information/platform-integrations.md (the X cost
section) and pricing-and-unit-economics.md (the 10x decision).

Implement X link handling in lib/platforms/x.ts.

1. prepareXPost() exactly as specified in platform-integrations.md —
   strip all URLs from the body, tidy whitespace, return the link
   separately.

2. Publishing sequence: body first, then the link as a threaded reply
   using the returned post ID.

3. If the reply fails: log it, do NOT roll back, do NOT retry the parent.
   The main post stands.

4. Store replyPostId on scheduled_posts.

5. Unit tests — this is Hard Rule 1 and it must never silently regress:
   - URL in the middle of text
   - multiple URLs
   - URL at the very end
   - no URL at all
   - URL-only body

6. A UI note explaining why the link moved. Users will ask, and the
   honest answer is good for us: it's cheaper AND it performs better,
   because X deprioritises posts sending people off-platform.

Then stop.
```

**Verify:** run the tests. Publish a real X post containing a link and confirm the body is clean and
the reply carries the URL.

---

## Task 3.3 — Channels and OAuth · ~10h

```
Read docs/product-information/platform-integrations.md and
features.md (F6).

Build channel connection.

1. OAuth flow via PostPeer for X, LinkedIn, Instagram, TikTok.
2. Store handle, display name, avatar, platformUserId, postpeerAccountId.
3. Health states: healthy / expiring / needs_reauth / revoked, visible
   in the UI.
4. Instagram: explain the Business/Creator account and linked Facebook
   Page requirement BEFORE the OAuth wall, with a link to Meta's
   instructions. This is the highest-friction step in the product.
5. TikTok: show username + avatar and a privacy selector before publish.
   Platform requirement, not optional.
6. Disconnect: remove tokens immediately, cancel that channel's queued
   posts.
7. Any token we store directly is encrypted via lib/crypto.ts. Never
   logged, never in Sentry breadcrumbs.

Then stop.
```

**Verify:** connect real X and LinkedIn accounts. Disconnect and confirm queued posts are cancelled.

---

## Task 3.4 — Scheduling · ~8h

```
Read docs/product-information/platform-integrations.md (timezones,
jitter), data-model.md (schedules, scheduled_posts), features.md (F7).

Build scheduling.

1. Per-channel cadence: days of week, times of day, user's IANA timezone.
2. trigger/queue-fill.ts — daily per project, fills 14 days forward from
   approved drafts. Creates scheduled_posts with idempotencyKey.
3. ±7 minutes jitter on every scheduled time. Posting at exactly 09:00:00
   daily is a robotic signature.
4. Timezone handling via Trigger.dev's timezone-aware schedules. Do not
   compute DST offsets by hand.
5. Pause a channel or a whole project without losing the queue.
6. Drag to reschedule.

Then stop.
```

**Verify:** set a schedule, run queue-fill, confirm 14 days appear at the right local times with
jitter applied. Test a DST boundary if your timezone has one.

---

## Task 3.5 — The publish job ⚠️ CRITICAL PATH · ~14h

**The most dangerous code in the product.** A double-post is visible, embarrassing, and on some
platforms a spam signal. Take your time.

```
Read docs/product-information/tech-architecture.md (publishing flow) and
platform-integrations.md (retry classification). Follow the sequence
exactly.

Build trigger/publish-execute.ts.

Sequence, in this order:
1. SELECT ... FOR UPDATE to claim the row, status queued -> publishing.
   If already publishing or published, exit silently. This is the retry
   guard and it is Hard Rule 5.
2. Token check, refresh if expiring within 24h.
3. X only: strip URLs from body per Task 3.2.
4. Platform call via the adapter.
5. Success: status published, store platformPostId and permalink.
   X with a link: publish the reply, store replyPostId.
6. Failure: transient -> retry with exponential backoff, max 5 attempts.
   Permanent -> status held with a plain-language holdReason.

Also:
- trigger/tokens-refresh-expiring.ts, daily, anything inside 72h.
  LinkedIn tokens are 60 days, TikTok 24 hours.
- Refresh failure: mark channel needs_reauth, email immediately, PAUSE
  that channel's queue. Never let a queue drain into a dead channel —
  that's how you lose a customer without ever hearing from them.

Tests — the critical ones:
- kill the job mid-publish, retry, assert exactly one post exists
- two workers claiming the same row simultaneously
- transient failure retries with backoff
- permanent failure holds and does not retry

Then stop.
```

**Verify:** run a real 3-day schedule against real accounts. Then deliberately kill the process
mid-publish and restart it. **If you get a double-post, stop and fix it before anything else.**

---

## Task 3.6 — Queue UI · ~8h

The main screen. Where users live. This carries the design's signature element.

```
Read docs/product-information/design.md — the Rail and post card sections.

Build the queue screen.

- The Rail: vertical 1px rule, posts as ticks spaced by time, mono
  timestamps, solid accent "now" line that moves in real time
- Post cards flush against the rail
- HELD posts break alignment — shift 24px left, gap in the rail, dashed
  connector. This is the signature: you see something is wrong before
  reading a word
- Status pills per design.md
- Filter by channel, by status
- Needs-review items get the highlight wash
- Held banner: which check failed, why, what to do, three actions
- Empty state as an invitation, per the copy rules

Then stop.
```

**Verify:** a queue containing published, publishing, queued, and held posts. The held one should be
obvious at a glance.

---

## Task 3.7 — Instagram and TikTok thin slice · ~4h

**Cut this first if you're behind.** Almost no MVP value for a B2B SaaS ICP.

```
Read docs/product-information/platform-integrations.md (Instagram,
TikTok) and mvp-scope.md.

Publish-only. No media generation.

1. Presigned R2 upload direct from the browser. Media never touches the
   Next.js server.
2. Validate dimensions and duration per platform-integrations.md.
3. AI writes the caption from the idea. Never imply content the media
   doesn't show.
4. Instagram: no clickable links in captions — say "link in bio", never
   emit a bare URL.
5. TikTok: username, avatar, and privacy selector shown before publish.

Then stop. Phase 3 is complete after this.
```

---

## Troubleshooting

**Double-posting** — your claim isn't atomic. Confirm `FOR UPDATE` is inside a transaction and the
status check happens *after* the lock, not before.

**Posts firing at the wrong time** — you're storing local time instead of UTC, or computing offsets
manually. Store UTC, let Trigger.dev handle the zone.

**LinkedIn 401 after ~60 days** — expected. That's the refresh job's job. If it isn't firing, check
it's deployed.

**X rejects with 403 duplicate** — X blocks identical content across accounts and time. This is a
permanent failure; hold it, don't retry.

**Instagram OAuth fails silently** — almost always a personal account, or a Business account with no
linked Facebook Page. This is why Task 3.3 explains it up front.

**Trigger.dev tasks timing out** — don't sleep inside a task. Use `delay` to schedule the next run.
You're billed per compute-second.

---

## Gate passed?

Tick the boxes. Then → **[Phase 4](phase-4-reddit.md)**.

**Do not proceed with a known double-post bug.** Everything in Phase 4 publishes through this code
path, and Reddit punishes duplicates harder than any other platform.
