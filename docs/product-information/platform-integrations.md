# Platform Integrations

Most of this product's bugs will live in this file's territory. Read the relevant section before
touching any platform code.

**Architecture:** PostPeer for X, LinkedIn, Instagram, TikTok. **Reddit direct.**

Rationale in [`decisions.md`](decisions.md) — short version: PostPeer has already cleared the Meta
App Review and TikTok audit, which saves 4–8 weeks of calendar time we don't have, and bills per
credit with unlimited connected accounts, which suits multi-tenant SaaS. It does **not** support
Reddit, which is fine — Reddit is the part we want to own anyway.

---

## PostPeer layer

**Model:** credits, not per-account. Unlimited connected accounts on every plan.

| Action | Credits |
|---|---|
| Post to LinkedIn / Instagram / TikTok / Threads / Bluesky | 1 |
| Post to X **without** a URL in the body | 5 |
| Post to X **with** a URL in the body | **50** |
| Analytics request | 1 |

Plans: Free 20 credits · Starter $25 / 2,000 · Standard $43 / 6,000 · Pro $120 / 20,000.

**The 50-credit line is the single most important number in this codebase.** See the X section.

**Before launch, ask them about:**
- **White-label / "done for you"** — they set up branded OAuth apps so the consent screen says
  *Postbliz*, not *PostPeer*. Without this, users see a third-party name mid-onboarding and some will
  bounce. Get the price.
- Rate limits per API key at our expected volume.
- Webhook payloads for publish success/failure.
- What happens to our connected accounts if we churn — exit risk.

**Wrap it.** All PostPeer calls go through `lib/platforms/postpeer.ts` behind our own interface. If
they raise prices, get acquired, or go down, we swap the adapter, not the app. Never import their
SDK outside that file.

---

## X (Twitter)

### The cost problem — read this before writing any X code

X moved to pay-per-usage in February 2026. Their published rates: $0.005 per post read, $0.010 per
user read, $0.015 per post created — and **$0.20 if the post contains a URL**, added April 2026. The
old $200 Basic and $5,000 Pro tiers are closed to new signups. PostPeer passes this straight through
as the 5-vs-50 credit split.

**Rule 1: links never go in an X post body.**

```ts
// lib/platforms/x.ts
const URL_RE = /https?:\/\/[^\s]+/gi;

export function prepareXPost(draft: Draft): { body: string; replyBody: string | null } {
  const found = draft.body.match(URL_RE) ?? [];
  if (found.length === 0) return { body: draft.body, replyBody: null };

  // strip, tidy whitespace, move to reply
  const body = draft.body.replace(URL_RE, "").replace(/\s+/g, " ").trim();
  const replyBody = draft.linkUrl ?? found[0];
  return { body, replyBody };
}
```

Publish the body first, then the reply as a threaded response using the returned post ID. If the
reply fails, the main post still stands — log it, don't roll back, don't retry the parent.

This is not only a cost decision. Link-in-reply is widely believed to perform better on X because
the algorithm deprioritises posts that send people off-platform. So the cheap path is also the good
path. Say this in the UI when the user asks why their link moved.

At 100 customers × 21 X posts/month: links in body ≈ **$655/mo**, links in reply ≈ **$63/mo**.

### Constraints

| | |
|---|---|
| Char limit | 280 (free accounts). Do not assume premium |
| Threads | Supported. Store parts in `drafts.threadParts` |
| Media | Up to 4 images, or 1 video |
| Reads | Expensive. Voice-profile sampling from X is a **paid-tier only** feature |

### Failure modes

| Error | Handling |
|---|---|
| 429 rate limit | Transient. Backoff, retry up to 5 |
| 403 duplicate content | Permanent. Hold, tell the user it's a repeat |
| 401 | Token dead. Mark channel `needs_reauth`, email immediately |

---

## LinkedIn

### Constraints

Two distinct worlds, different scopes and different approvals: personal profiles use
`w_member_social`, company Pages use `w_organization_social` via the Community Management API.
**MVP is personal profiles only** — that's where our ICP posts anyway, and it's the lighter path.

| | |
|---|---|
| Char limit | 3,000. Practical sweet spot 1,200–1,800 |
| Tokens | Access 60 days, refresh 365 days. **The most common silent failure in this product** |
| Rate limit | ~100 calls/day/member |
| Link previews | The Posts API does **not** scrape URLs. No automatic preview card — set it explicitly or accept a bare link |
| Formatting | No markdown. Line breaks only. Unicode bold is a trick our users will expect — support it |

### Token expiry is the operational risk

60 days means every user hits re-auth roughly every two months. If you handle this badly, channels
die silently and users churn without telling you why.

- `tokens.refresh-expiring` runs daily, refreshes anything inside 72h
- On refresh failure → `needs_reauth` → email immediately, banner in-app, pause that channel's queue
- **Never let a queue silently drain into a dead channel.** Pause and shout.

---

## Reddit — direct integration

**Do not write Reddit code without reading [`reddit-safety.md`](reddit-safety.md).**

### Setup

Own OAuth app at reddit.com/prefs/apps, type "web app". Scopes: `identity`, `submit`, `read`,
`flair`, `mysubreddits`. Reddit **requires** a descriptive `User-Agent` that honestly identifies the
app and version — sending a generic or misleading one is a fast route to being blocked:

```
User-Agent: web:com.postbliz.app:v1.0.0 (by /u/postbliz)
```

### Constraints

| | |
|---|---|
| Rate limit | 100 queries/minute (OAuth). Generous for our use |
| Commercial use | Contract required at scale, ~$0.24 per 1,000 calls. We're far below this at MVP — **revisit at 500 users** |
| Title | 300 chars |
| Body | 40,000 chars |
| Tokens | Access 1 hour, refresh permanent unless revoked. Refresh aggressively |
| Flair | Many subs require it. Fetch available flairs, block the post if required and unset |

### What makes Reddit different

Reddit is the only platform where **the content itself must be independently conceived.** A
reformatted X post will be removed as spam and may get the account banned. Reddit content is
generated from scratch with a different prompt, different structure, and a value-first framing where
the product is mentioned once, late, or not at all.

Every Reddit publish runs the six-check gate. No exceptions, no "just this once" flag.

---

## Instagram

Publish-only at MVP. AI writes the caption; the user supplies the media.

| | |
|---|---|
| Account type | Business or Creator only. Personal accounts cannot publish via API |
| Requires | Connected Facebook Page (handled by PostPeer) |
| Publishing | Two-step container model — create container, then publish. PostPeer abstracts this |
| Caption | 2,200 chars, 30 hashtags max |
| Rate limit | ~200 calls/user/hour; ~25 posts/24h |
| Media | Feed: 1080×1080 or 1080×1350. Reels: 1080×1920, ≤90s |
| Links | Not clickable in captions. Never generate a caption with a bare URL — say "link in bio" |

**Onboarding UX:** connecting Instagram is the highest-friction step in the product because of the
Business-account and Page requirements. Detect and explain it before they hit the OAuth wall, with a
link to Meta's instructions.

---

## TikTok

Publish-only at MVP. User uploads video; AI writes the caption.

| | |
|---|---|
| Access | PostPeer has cleared the audit. **Do not attempt our own** — unaudited apps are capped at 5 users per 24h and all posts are forced private |
| Tokens | Access 24 hours, refresh 365 days. Shortest expiry of any platform |
| Caption | 2,200 chars |
| Video | MP4, ≤1GB, 3s–10min, 9:16 |
| Rate limit | ~6 posts/min, 25 videos/day/account |

### Mandatory UX requirements

TikTok verifies these during audit and they apply to us as a downstream integrator. Build them once,
reuse everywhere — they're good practice regardless:

1. Show the creator's **username and avatar** before every post
2. Offer a **privacy-level selector** (public / friends / private)
3. Disclose commercial/branded content where applicable
4. Show comment/duet/stitch toggles where the account allows them

---

## Cross-platform rules

### Content is platform-native, always

One *idea* becomes N *drafts*. Never one text pushed to five endpoints — cross-posting identical
content is the clearest possible bot signal and reads badly to humans.

| Platform | Register | Length | Link handling |
|---|---|---|---|
| X | Punchy, lowercase-tolerant, one idea | 200–280 | **First reply, never body** |
| LinkedIn | Reflective, structured, hook + payoff | 1,200–1,800 | In body, fine |
| Reddit | Conversational, value-first, no marketing voice | 300–1,500 | Sparingly, often none |
| Instagram | Warm, visual-first, caption supports the image | 100–300 | "Link in bio" |
| TikTok | Hook in first 3 words, casual | 50–150 | In bio |

### Retry classification

```ts
type PublishResult =
  | { ok: true; postId: string; permalink: string }
  | { ok: false; kind: "transient"; retryAfterMs?: number; message: string }
  | { ok: false; kind: "permanent"; userMessage: string; code: string };
```

- **transient** — 429, 5xx, network, timeout → exponential backoff, max 5 attempts
- **permanent** — 401/403, validation, policy, duplicate → `held` with a plain-language reason

Never retry a permanent failure. Never surface a raw platform error string to a user — translate it.

### Timezones

Store UTC. Schedule in the user's IANA zone. Trigger.dev handles DST correctly when given a zone —
use it rather than computing offsets by hand.

### Jitter

Every scheduled time gets ±7 minutes of random jitter. Posting at exactly 09:00:00 daily is a robotic
signature that pattern-detection systems notice. Cheap insurance.

## Related

- [`reddit-safety.md`](reddit-safety.md) — mandatory before Reddit work
- [`pricing-and-unit-economics.md`](pricing-and-unit-economics.md) — the credit math
- [`risk-register.md`](risk-register.md) — platform dependency risk
