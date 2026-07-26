# Dev notes — recurring gotchas & the auto-handle checklist

Small issues that have bitten us, why, and the fix. **The point of this file:**
when implementing anything, handle these without being told. Add to it whenever a
new class of small issue appears.

---

## The auto-handle checklist (do these without being asked)

- **Replace scaffold defaults in any area you touch.** create-next-app leaves a
  default `app/page.tsx`, README, `AGENTS.md`, `layout.tsx` title, `globals.css`.
  If you build in an area, don't leave the scaffold behind.
- **Dev runs on `:3000`, always.** `BETTER_AUTH_URL` and the Google redirect URI
  are `http://localhost:3000`. If a stray server squats `:3000`, Next silently
  bounces to `:3001` and OAuth callbacks break. Kill the stray; never leave
  background dev servers running.
- **Trigger.dev features need two terminals in dev.** `bun run dev` (app) **and**
  `bunx trigger.dev@<pinned-version> dev` (worker). Without the worker, tasks
  enqueue but never run — the UI hangs on "in progress". Say so whenever a
  feature uses a task.
- **After any `.env` edit, normalise line endings.** Editing `.env` in a Windows
  editor re-adds CRLF; a trailing `\r` corrupts values (broke `ENCRYPTION_KEY`
  and the OpenRouter `Authorization` header). Run `sed -i 's/\r$//' .env`, and
  `.trim()` any env value used in an HTTP header or as a key.
- **One env file: `.env`.** Never split across `.env` and `.env.local` — Next
  loads `.env.local` *over* `.env`, so an empty var in one silently blanks the
  other. Client-exposed vars need the **`NEXT_PUBLIC_`** prefix (PostHog key/host,
  Sentry DSN); server-only vars stay unprefixed.
- **`await headers()` / `await cookies()`** — async in Next 16.
- **Pin every `@trigger.dev/*` package to the exact CLI version.** A caret range
  makes `trigger.dev dev` abort with a version-mismatch error in non-interactive
  shells.
- **Verify features in the running app, not just types.** Typecheck passing ≠
  working. Drive the real flow.

---

## Known gotchas (the "why")

**Auth / OAuth**
- The BetterAuth **`app/api/auth/[...all]/route.ts` catch-all handles every auth
  path**, including `/api/auth/callback/google`, `/sign-in/social`, etc. Never add
  a per-provider callback route.
- Google OAuth in "Testing" mode only lets **listed test users** sign in; others
  get "Access blocked". Add your account under OAuth consent screen → Test users.
- Callback failures with `ERR_CONNECTION_REFUSED` almost always mean the app
  wasn't on `:3000` when Google redirected back. It's the port issue, not the code.

**Trigger.dev**
- Task files (`trigger/*.ts`) and anything they import use **relative imports**
  (`../db`, `../lib/...`), not the `@/` alias — safer for the task bundler.
- Never import from `"bun"` in a schema or task file; `drizzle-kit` and the task
  build run under Node and can't resolve it.

**Sentry**
- Under Turbopack you **must** wrap `next.config` with `withSentryConfig`.
  Init-only breaks the dev server (`Cannot find module require-in-the-middle-…`).
  See decision D19.

**Database (Neon)**
- Pooled `DATABASE_URL` for the app runtime (`prepare: false`), direct
  `DATABASE_URL_UNPOOLED` for `drizzle-kit` migrations.
- `id` defaults use native PG18 `uuidv7()` — Neon runs PG18. See D16.

**Windows**
- Git shows `LF will be replaced by CRLF` warnings — harmless, but the CRLF is
  what corrupts `.env` values at runtime. Normalise `.env` after edits.
