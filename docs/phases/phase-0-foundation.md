# Phase 0 — Foundation

**~50h · Weeks 1–2 · Prerequisite:** none
**Read first:** [`tech-architecture.md`](../product-information/tech-architecture.md) ·
[`data-model.md`](../product-information/data-model.md) ·
[`open-source.md`](../product-information/open-source.md) ·
[`design.md`](../product-information/design.md)

## Goal

Nothing user-facing. Get the skeleton right so nothing later is a rewrite. The two things that are
genuinely painful to retrofit — the full schema and idempotent job infrastructure — go in now.

## Gate

- [ ] Sign up with email, land in the app
- [ ] Create a project, see it in the switcher
- [ ] A Trigger.dev scheduled task fires every minute and logs
- [ ] `bun run build` passes with zero TypeScript errors
- [ ] Repo is public on GitHub, `git status` shows no `.env` files ever committed
- [ ] Design tokens render — a test page shows correct colours and both fonts

## Not in this phase

No crawling, no LLM calls, no OAuth, no publishing, no billing. If a prompt tempts you toward any of
those, you've drifted.

---

## Task 0.1 — Repo hygiene and structure · ~4h

You've scaffolded. This finishes the skeleton and — most importantly — locks down secrets **before**
anything sensitive exists. Public repo, permanent history: a leaked key means rotating everything.

```
Read CLAUDE.md, docs/product-information/tech-architecture.md,
open-source.md, and design.md.

Next.js is already scaffolded. Do NOT re-scaffold. Then stop — no schema,
no auth, no features.

1. Confirm the git remote points at my GitHub repo (already set — `origin`
   points at the repo and `main` is pushed). Verify and continue.

2. Replace AGENTS.md with a pointer to CLAUDE.md. One source of truth —
   two files that disagree is worse than one.

3. tsconfig: add noUncheckedIndexedAccess to the existing strict config.

4. Port the design.md token block into app/globals.css: put the raw tokens
   on :root and keep design.md's @media (prefers-color-scheme: dark)
   override block. Then add an @theme inline block mapping them into
   Tailwind's --color-* namespace (--color-ink: var(--ink)) — utilities like
   bg-ink need that namespace, and @theme INLINE keeps the var() indirection
   so colours flip under the media query (plain @theme bakes the value and
   won't). "Do not invent tokens" governs the raw values; the --color-* names
   are Tailwind's required mapping, not new tokens. Add Instrument Sans and
   JetBrains Mono via next/font.

5. shadcn/ui init, configured against those tokens. Then REMOVE the
   @custom-variant dark (&:is(.dark *)) line its init adds, and put any
   shadcn token overrides inside the prefers-color-scheme block — so dark
   mode has one mechanism (system preference), not a competing .dark class.

6. Create the folder structure from open-source.md with .gitkeep files:
   app/(marketing)/ app/(app)/ app/api/
   lib/agents/prompts/ lib/platforms/ lib/reddit/ db/
   trigger/ components/ui/ components/

7. lib/crypto.ts — AES-256-GCM encrypt/decrypt pair reading ENCRYPTION_KEY
   from env. Implement properly, with a unit test. This is Hard Rule 4 and
   every token in the system depends on it.

8. Open-source files per open-source.md: LICENSE (full AGPL-3.0),
   CONTRIBUTING.md, SECURITY.md, CLA.md, NOTICE, .env.example (every var
   from tech-architecture.md, no values). Rewrite README.md — replace the
   Next.js default with what Postbliz is, self-host quickstart, and the
   honest "$20-60/mo in your own API keys" note.

9. .gitignore must cover .env*, .trigger, .vercel, spike.ts — and keep
   .env.example tracked. Add gitleaks as a pre-commit hook and a CI job.
   Run `git status` and confirm zero .env files before committing.

10. Commit and push.

Then print what remains in Phase 0. Do not start Task 0.2.
```

**Verify:** `git log --stat` shows no `.env`. Visit `/` and confirm fonts and colours are live.

---

## Task 0.2 — The full schema · ~10h

**Migrate everything now, including tables you won't touch until Phase 4.** Retrofitting `user_id`
onto existing rows or adding a unique constraint to a populated table is genuinely painful. Empty
tables cost nothing.

```
Read docs/product-information/data-model.md in full, and CLAUDE.md.

Set up Drizzle against Neon and migrate the ENTIRE schema from
data-model.md. Every table, including ones unused until later phases.

- Enable the vector extension in the first migration
- Every table exactly as specified — do not simplify or defer columns
- Verify uniqueIndex on scheduled_posts.idempotencyKey exists (Hard Rule 5)
- Verify every user-scoped table carries user_id — except link_clicks, the
  one documented exception (public visitor traffic) (Hard Rule: tenancy)
- db/index.ts exporting a typed client
- db/scoped.ts — a query helper that forces a user_id filter. All user data
  goes through it; hand-written where clauses on user data are how tenant
  leaks happen in a public repo. It must expose an explicit opt-out for
  non-tenant tables (link_clicks), not force a bogus user_id onto them.

Add a seed script creating one user, one project, one channel for local dev.

Do NOT write any business logic or queries beyond the seed. Then stop.
```

**Verify:** `drizzle-kit studio`, confirm every table from `data-model.md` exists. Deliberately try
inserting two rows with the same `idempotencyKey` — it must fail.

---

## Task 0.3 — Auth · ~8h

```
Read CLAUDE.md and docs/product-information/tech-architecture.md.

Set up BetterAuth with the Drizzle adapter.

- Email/password + Google OAuth
- Let BetterAuth own its tables via its adapter — do not hand-write them
- Session handling, middleware protecting /app/*
- Sign-up, sign-in, sign-out pages using our design tokens
- Redirect to project creation on first sign-in

Keep the UI minimal but on-token. No feature work. Then stop.
```

**Verify:** sign up, sign out, sign in. Hit an `/app` route logged out and confirm the redirect.

---

## Task 0.4 — Job infrastructure · ~8h

```
Read docs/product-information/tech-architecture.md — the job sections.

Wire Trigger.dev v4.

- Configure and deploy
- trigger/health-check.ts — scheduled every minute, logs a timestamp,
  confirms DB connectivity
- lib/jobs/enqueue.ts — the single helper routes use to enqueue work.
  Per architecture: API routes NEVER call third parties, they enqueue only
- A worked example of the idempotent claim pattern from tech-architecture.md
  (SELECT ... FOR UPDATE, status transition) in trigger/_example-claim.ts,
  commented as a reference implementation for Phase 3

Do NOT build publishing, generation, or crawling. Then stop.
```

**Verify:** health-check appears in the Trigger.dev dashboard firing every minute.

---

## Task 0.5 — App shell and observability · ~12h

```
Read docs/product-information/design.md and ICP.md.

Build the app shell only. No features.

- Sidebar per design.md, project switcher in the header
- Route stubs: /app/queue /app/knowledge /app/channels /app/settings
  Each an empty state, written per design.md's copy rules — empty states
  are invitations to act, not "no data found"
- Create-project flow: name, URL, timezone (default to browser IANA zone)
- Sentry with a beforeSend scrubber dropping anything matching token or
  key patterns. We hold OAuth tokens and this repo is public.
- PostHog, with the activation funnel events from growth.md stubbed:
  signup, url_entered, first_post_generated, channel_connected,
  first_post_published

Then stop. Phase 0 is complete after this.
```

**Verify:** navigate every route. Trigger a test error, confirm it reaches Sentry with no secrets in
the payload.

---

## Troubleshooting

**`create-next-app` refused to run** — it whitelists `docs/`, `.git`, `.gitignore`, `LICENSE`, but
not `CLAUDE.md`. Move that file out, scaffold, move it back.

**Tailwind classes not applying** — v4 needs the `--color-*` prefix inside `@theme` to generate
utilities. `--ink` alone gives you a CSS variable, not a `bg-ink` class.

**Neon connection hanging** — use the pooled connection string for the app, the direct one for
migrations. Drizzle Kit needs direct.

**`vector` extension error** — `CREATE EXTENSION IF NOT EXISTS vector;` must be the first statement
in your first migration, before any table using it.

**Trigger.dev task not firing** — check it's deployed, not just written. `npx trigger.dev@latest
deploy`. Local dev needs `npx trigger.dev@latest dev` running in a separate terminal.

**Windows/PowerShell** — most docs assume bash. `&&` works in PowerShell 7+ but not 5.1; use `;` or
separate lines if chaining fails.

---

## Gate passed?

Tick the boxes at the top. Then → **[Phase 1](phase-1-ingestion.md)**.

If you haven't run the spike yet (Task 1.0), do it now before building anything further. It's the
only step that can tell you to stop.
