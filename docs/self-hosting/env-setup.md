# Environment setup — from zero to a filled `.env.local`

This walks through every service Postbliz talks to, in the order you'll actually
need them. Follow it top to bottom and you'll have a working `.env.local`.

**Two files:**

- **`.env.example`** — tracked in git, placeholders only, the canonical list of vars.
- **`.env.local`** — gitignored, holds your real values. Next.js loads it automatically.

```bash
cp .env.example .env.local   # if you don't already have one
```

`.gitignore` ignores `.env*` but keeps `!.env.example`, so real values can never be
committed by accident. **Never put a real secret in `.env.example`.**

**Phase ordering.** You do **not** need every service on day one. Phase 0 needs only
the database, auth, jobs, and observability blocks. Sign up for the rest as you reach
the phase that uses them.

| Block | Vars | Needed by |
|---|---|---|
| Core secrets | `ENCRYPTION_KEY`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | Phase 0 |
| Neon | `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | Phase 0 |
| Google OAuth | `GOOGLE_CLIENT_ID/SECRET` | Phase 0 |
| Trigger.dev | `TRIGGER_SECRET_KEY` | Phase 0 |
| Sentry + PostHog | `SENTRY_DSN`, `NEXT_PUBLIC_POSTHOG_KEY/HOST` | Phase 0 |
| Firecrawl / OpenRouter / R2 | crawl, LLM, media | Phase 1 |
| PostPeer / Reddit / shortlink | publishing | Phase 2–3 |
| Dodo / Resend | billing, email | Phase 4 |

---

## 0. Core secrets — no account needed (Phase 0)

These are random values you generate locally. If you ran the setup, they're already
in `.env.local` — regenerate any time with:

```bash
openssl rand -base64 32      # run once for ENCRYPTION_KEY, once for BETTER_AUTH_SECRET
```

Windows PowerShell equivalent:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }) -as [byte[]])
```

| Var | Value |
|---|---|
| `ENCRYPTION_KEY` | 32-byte base64. Encrypts stored OAuth tokens (Hard Rule 4). **Rotating it invalidates every stored token** — treat as permanent per environment. |
| `BETTER_AUTH_SECRET` | 32-byte base64. Signs session cookies. |
| `BETTER_AUTH_URL` | `http://localhost:3000` locally; your real origin in prod. |

---

## 1. Neon — Postgres database (Phase 0)

**What:** your Postgres database. Neon runs Postgres 18 by default for new projects,
which matters later (native `uuidv7()` for sortable IDs).

1. Sign up at **neon.com** → **New Project**. Pick a region near you; leave the
   Postgres version at the default (18).
2. On the project dashboard, open **Connect** (or **Connection Details**).
3. You need **two** strings from the same database:
   - **Pooled** — the one whose host contains `-pooler`. This is `DATABASE_URL`
     (the app runtime uses it; it survives Neon's scale-to-zero and many connections).
   - **Direct / unpooled** — toggle **"Pooled connection" off** to reveal it. This is
     `DATABASE_URL_UNPOOLED` (migrations use it; `drizzle-kit` needs a direct connection).
4. Both end with `?sslmode=require` — keep that.

```
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

> **Why two?** A connection pooler multiplexes many app connections, but `drizzle-kit`
> migrations open a direct session (advisory locks, DDL) and misbehave through a pooler.
> The app wants pooled; migrations want direct. This split is the single most common
> Neon + Drizzle setup mistake.

---

## 2. Google OAuth — social sign-in (Phase 0)

**What:** "Sign in with Google" for BetterAuth. No billing/card needed, and **no special
API needs enabling** — basic sign-in reads identity from Google's OpenID `userinfo`
endpoint, which works out of the box.

1. **console.cloud.google.com** → project dropdown → **New Project** (`Postbliz`) → select it.
2. **OAuth consent screen** (newer console: **Google Auth Platform → Branding**):
   - **User type: External.**
   - Required fields only: App name (`Postbliz`), your support email, your developer email.
   - Leave publishing status **"Testing"** — no Google verification needed for dev.
   - **Add a test user** (OAuth screen → Test users / **Audience**): add the Gmail you'll log
     in with. In Testing mode, only listed test users can sign in.
   - **Scopes:** add none. BetterAuth requests `openid`, `email`, `profile` by default —
     non-sensitive, no verification required.
3. **APIs to enable: none** for sign-in. (Optional, skip for now: enable **People API** only
   if you later want richer profile data.)
4. **Credentials → Create Credentials → OAuth client ID** → Application type
   **Web application** (name it `Postbliz Web (dev)`):
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs** (must match BetterAuth's callback exactly):
     - `http://localhost:3000/api/auth/callback/google`
     - `https://yourdomain.com/api/auth/callback/google` (add when you deploy — don't replace localhost)
5. Copy the **Client ID** and **Client secret**.

```
GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxx
```

> **Gotcha:** if the redirect URI doesn't match byte-for-byte (trailing slash, http vs
> https, port), Google returns `redirect_uri_mismatch`. Add both localhost and prod now.

---

## 3. Trigger.dev — background jobs (Phase 0)

**What:** every third-party call (crawl, generate, publish) runs as a Trigger.dev task,
never in an API route.

1. Sign up at **trigger.dev** → **New Project**.
2. **Project Settings → API Keys.** There are separate **dev** and **prod** secret keys
   (they start with `tr_dev_` / `tr_prod_`).
3. Use the **dev** key locally.

```
TRIGGER_SECRET_KEY=tr_dev_xxxxxxxx
```

> Local dev also needs `npx trigger.dev@latest dev` running in a separate terminal, and
> `npx trigger.dev@latest deploy` to ship tasks. The key above is all `.env.local` needs.

---

## 4. Sentry — error tracking (Phase 0)

**What:** captures runtime errors. A `beforeSend` scrubber will strip anything token-shaped
before it leaves your server (this repo is public).

1. Sign up at **sentry.io** → **Create Project** → platform **Next.js**.
2. Copy the **DSN** from **Project Settings → Client Keys (DSN)**.

```
SENTRY_DSN=https://xxxxxxxx@oyyyy.ingest.sentry.io/zzzz
```

---

## 5. PostHog — product analytics (Phase 0)

**What:** the activation funnel (signup → url_entered → first_post_generated → …).

1. Sign up at **posthog.com**. Pick a cloud region — **US** or **EU** — and remember which.
2. **Project Settings** → copy the **Project API Key** (starts with `phc_`).
3. Set the host to match your region.

```
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com   # or https://eu.i.posthog.com
```

> These are `NEXT_PUBLIC_` because the browser SDK reads them — they're not secrets.

---

## 6. Firecrawl — site crawling (Phase 1)

**What:** turns a product URL into clean markdown. Never write your own scraper.

1. Sign up at **firecrawl.dev** → **API Keys** → copy the key (starts with `fc-`).

```
FIRECRAWL_API_KEY=fc-xxxxxxxx
```

---

## 7. OpenRouter — LLM routing (Phase 1)

**What:** one API in front of many models; the Vercel AI SDK routes tasks to model tiers.

1. Sign up at **openrouter.ai** → **Keys → Create Key**.
2. **Set a monthly spend limit on the key now** — this is a hard rule for margin safety.

```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
```

---

## 8. Cloudflare R2 — object storage (Phase 1)

**What:** media (images/video). Uploads go browser → R2 directly, never through Next.

1. Sign up at **cloudflare.com** → **R2** (needs a card on file even for the free tier).
2. **Create bucket** — name it e.g. `postbliz-media` → that's `R2_BUCKET`.
3. Your **Account ID** is on the R2 overview page → `R2_ACCOUNT_ID`.
4. **Manage R2 API Tokens → Create API Token** (Object Read & Write). It returns an
   **Access Key ID** and **Secret Access Key** (S3-compatible) — shown once, copy both.

```
R2_ACCOUNT_ID=xxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxx
R2_BUCKET=postbliz-media
```

---

## 9. PostPeer — publishing to X / LinkedIn / IG / TikTok (Phase 2–3)

**What:** the commodity publisher for the non-Reddit platforms.

1. Sign up at **postpeer** → get your **API key** from the dashboard.

```
POSTPEER_API_KEY=xxxxxxxx
```

---

## 10. Reddit — direct integration (Phase 2–3)

**What:** Reddit is published directly (not via PostPeer) because Reddit safety is the moat.

1. Log in to Reddit → **reddit.com/prefs/apps** → **create another app**.
2. Type: **web app**. Set the redirect URI to your OAuth callback
   (e.g. `http://localhost:3000/api/reddit/callback`).
3. The **Client ID** is the string just under the app name; the **secret** is labelled `secret`.
4. `REDDIT_USER_AGENT` must honestly identify the app — Reddit rejects generic agents.

```
REDDIT_CLIENT_ID=xxxxxxxx
REDDIT_CLIENT_SECRET=xxxxxxxx
REDDIT_USER_AGENT=postbliz/0.1 (by u/yourusername)
```

---

## 11. Shortlink domain (Phase 3)

**What:** the domain click-tracked short links resolve from. Not a service key — a domain
you own and point at the app.

```
SHORTLINK_DOMAIN=pblz.link
```

---

## 12. Dodo Payments — billing (Phase 4)

**What:** merchant of record. Handles checkout and sends webhooks on subscription events.

1. Sign up at **dodopayments.com** → **Developer → API Keys** → copy the key.
2. **Developer → Webhooks** → add your endpoint (`https://yourdomain.com/api/webhooks/dodo`)
   → copy the **signing secret** → `DODO_WEBHOOK_SECRET`.

```
DODO_API_KEY=xxxxxxxx
DODO_WEBHOOK_SECRET=whsec_xxxxxxxx
```

> Webhook handlers must verify this signature and be idempotent — webhooks retry and
> arrive twice.

---

## 13. Resend — transactional email (Phase 4)

**What:** digests and re-auth nudges.

1. Sign up at **resend.com** → **API Keys → Create** → copy (starts with `re_`).
2. Add and verify your sending domain when you're ready to send from it.

```
RESEND_API_KEY=re_xxxxxxxx
```

---

## Verify

Once the Phase 0 block is filled:

```bash
# no placeholder values left in the Phase 0 block
grep -E '^(ENCRYPTION_KEY|BETTER_AUTH_SECRET|DATABASE_URL|DATABASE_URL_UNPOOLED|GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET|TRIGGER_SECRET_KEY)=$' .env.local

# confirm .env.local is NOT tracked and .env.example IS
git status --short .env.local .env.example
```

The first command should print nothing (every Phase 0 var has a value). The second should
show `.env.example` staged/tracked and `.env.local` absent (ignored).
