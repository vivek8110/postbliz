---
title: "fix: Phase 0 foundation doc corrections"
type: fix
date: 2026-07-25
---

# fix: Phase 0 foundation doc corrections

## Summary

Make Phase 0 internally consistent and safe to run by correcting `docs/pahses/phase-0-foundation.md` and the four source docs it derives from. Resolve two self-contradictions, harden three schema traps in `data-model.md`, and clean the doc rot — so a later `/ce-work` run against the phase doc doesn't trip over its own instructions. This plan edits planning docs and the schema spec only; it does not execute Phase 0 (no installs, migrations, or app code).

---

## Problem Frame

A pressure test of `phase-0-foundation.md` against its source docs surfaced 12 findings across three severities. The doc halts on its own first step, contradicts itself in two places, and inherits three schema traps that are cheap to fix now and painful after tables exist.

Some findings are already resolved this session and are recorded here only so the plan is honest about remaining work:

- **GitHub remote blocker** — the repo now exists and is pushed (`origin/main` at `cba6ec3`), so Task 0.1 step 1 ("confirm the remote… if not, stop") passes instead of halting.
- **Env template** — `.env.example` (all vars, phase-grouped) and the `.gitignore` `!.env.example` exception are committed; the Neon pooled/direct split, Google OAuth, and PostHog host gaps are filled in the template. What remains is reconciling the *source* env list in `tech-architecture.md` to match.
- **Neon on PG18** — a live smoke test against both connection strings returned PostgreSQL 18.4, so native `uuidv7()` is confirmed available (settles the schema-hardening approach empirically, not just from docs).

The remaining findings are doc/spec corrections, sequenced below.

---

## Requirements

**Consistency**

- R1. `phase-0-foundation.md` and the source docs reference bun as the package manager — no `pnpm` in the gate or troubleshooting.
- R2. `db/` lives at repo root consistently across `phase-0-foundation.md`, `open-source.md`, `CLAUDE.md`, and `data-model.md` — no `lib/db/`.
- R3. The `tech-architecture.md` environment-variable list includes every var in the committed `.env.example`: the Neon direct URL, Google OAuth client id/secret, and the PostHog host.

**Technical correctness**

- R4. `data-model.md` `id` columns specify sortable uuidv7 via native `uuidv7()`, with the app-side fallback noted for pre-18 local databases.
- R5. The `db/scoped.ts` helper design documents an escape hatch for tables without `user_id` (`linkClicks`), and Task 0.2's "verify every user-scoped table carries user_id" wording names that exception.
- R6. The design-token guidance resolves the `@theme` namespace collision (via `@theme inline`) and specifies a single dark-mode mechanism (`prefers-color-scheme`), removing the shadcn `.dark`-class conflict.

**Hygiene**

- R7. The phases folder is named `docs/phases/` (renamed from the `docs/pahses/` typo) and every `CLAUDE.md` link to it resolves.
- R8. `phase-0-foundation.md` records that the GitHub-remote prerequisite is satisfied, so Task 0.1 step 1 no longer reads as a hard stop.

---

## Key Technical Decisions

- **uuidv7 via native `uuidv7()` DB default (not a JS library).** Neon runs PG18 (verified live), so `id: uuid("id").primaryKey().default(sql\`uuidv7()\`)` yields sortable v7 IDs with zero app dependencies and generation that also covers raw-SQL and backfill inserts. This sidesteps a real bun trap: `drizzle-kit` runs under Node, and importing `Bun.randomUUIDv7` into a schema file breaks generation (drizzle-orm#4469). Rejected: app-side `$defaultFn(() => uuidv7())` using the `uuid` npm package — kept only as the documented fallback if a pre-18 local Postgres is ever used, since it pins ID generation to app inserts.
- **One dark-mode mechanism: `prefers-color-scheme`, wired through `@theme inline`.** Map `--color-*` → `var(--token)` inside `@theme inline` (plain `@theme` bakes the value at build time and won't flip under a media query); keep raw token values on `:root` with a `@media (prefers-color-scheme: dark)` override; and **omit** shadcn's `@custom-variant dark (&:is(.dark *))` so Tailwind's default `dark:` variant follows the OS. This gives exactly one mechanism driving both variable recoloring and `dark:` utilities. Trade-off: no manual light/dark toggle — matches `design.md`'s system-preference intent; adding a toggle later means switching wholesale to the class strategy.
- **Root `db/` over `lib/db/`.** `CLAUDE.md` conventions and `data-model.md` already assume root `db/`; only `open-source.md`'s tree and `phase-0-foundation.md` step 6 disagree. Fix the two outliers rather than the three that are already right.
- **bun = package manager + local script runner; Node = deploy runtime.** Trigger.dev executes tasks on its Node cloud and Next.js builds on Node, so bun is scoped to install + local scripts. Corollary baked into R4: schema files must not import from `"bun"`, because `drizzle-kit` migrations run under Node.

---

## Implementation Units

### U1. Reconcile package manager and `db/` location across the docs

**Goal:** Remove the pnpm/bun and `db/`-location contradictions so the phase doc is internally consistent.
**Requirements:** R1, R2
**Dependencies:** none
**Files:** `docs/pahses/phase-0-foundation.md` (renamed to `docs/phases/` in U5 — edit whichever path is current at execution), `docs/product-information/open-source.md`
**Approach:**
- In `phase-0-foundation.md`: change the gate line `pnpm build` → `bun run build`; replace pnpm references in the Windows/PowerShell and Troubleshooting notes with bun (`bun install`, `bunx trigger.dev@latest`). In Task 0.1 step 6, drop `lib/db/` from the folder list and keep `db/` at repo root (alongside `lib/`, `trigger/`, etc.).
- In `open-source.md`: move `db/` out from under `lib/` in the prescribed tree to repo root, matching `CLAUDE.md` and `data-model.md`.
- Leave `CLAUDE.md` and `data-model.md` unchanged — they already specify root `db/`.
**Patterns to follow:** the `## Conventions` structure block in `CLAUDE.md` is the canonical folder layout.
**Test scenarios:** Test expectation: none — documentation change. Verification is a grep pass (below).
**Verification:** `grep -ri pnpm docs/` returns nothing in the phase doc; `grep -rn "lib/db" docs/` returns nothing; the two trees in `CLAUDE.md` and `open-source.md` list `db/` at the same level.

### U2. Close the env-list gap in `tech-architecture.md`

**Goal:** Make the source env list a superset-free match of the committed `.env.example`, so Task 0.1 step 8 ("every var from tech-architecture.md") produces a working template.
**Requirements:** R3
**Dependencies:** none
**Files:** `docs/product-information/tech-architecture.md` (the `## Environment variables` block)
**Approach:** Add the three vars the pressure test proved missing — `DATABASE_URL_UNPOOLED` (direct Neon string for `drizzle-kit`, distinct from the pooled `DATABASE_URL`), `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (Task 0.3 requires Google OAuth), and `NEXT_PUBLIC_POSTHOG_HOST`. Annotate the two `DATABASE_URL*` entries with pooled-vs-direct so the split is self-documenting. `.env.example` and the `.gitignore` exception are already committed (`cba6ec3`); this unit only updates the source doc they should mirror.
**Patterns to follow:** the existing aligned `NAME  comment` format in that code block.
**Test scenarios:** Test expectation: none — documentation change.
**Verification:** every non-comment key in `.env.example` appears in the `tech-architecture.md` list; the pooled/direct distinction is stated.

### U3. Fix the design-token and dark-mode guidance in the phase doc

**Goal:** Resolve the "port tokens / do not invent" vs. `--color-*` collision and the shadcn dark-mode conflict, replacing them with the settled single-mechanism approach.
**Requirements:** R6
**Dependencies:** none
**Files:** `docs/pahses/phase-0-foundation.md` (Task 0.1 steps 4–5), `docs/product-information/design.md` (append a short Tailwind-v4 integration note)
**Approach:**
- Rewrite step 4 to say: port `design.md`'s raw tokens onto `:root` unchanged, keep the `@media (prefers-color-scheme: dark)` override block, and add a separate `@theme inline` block mapping `--color-ink: var(--ink)` etc. Clarify that "do not invent tokens" governs the raw values — the `--color-*` names are Tailwind's required indirection, not new tokens.
- Rewrite step 5 to instruct: after shadcn init, **remove** the `@custom-variant dark (&:is(.dark *))` line it adds and place shadcn's own token overrides inside the existing `prefers-color-scheme` media block, so there is one dark-mode mechanism.
- In `design.md`, add a 3–4 line "Tailwind v4 integration" note capturing the `@theme inline` requirement and the no-manual-toggle trade-off, so the token source-of-truth carries the constraint.
**Patterns to follow:** `design.md`'s existing `:root` token block and its `@media (prefers-color-scheme: dark)` block are the shapes being mapped.
**Test scenarios:** Test expectation: none — documentation/spec change. (Runtime proof of the mechanism belongs to Phase 0.1's globals.css work, not this plan.)
**Verification:** step 4 references `@theme inline` and the reason plain `@theme` fails; step 5 explicitly removes the `.dark` `@custom-variant`; `design.md` carries the integration note.

### U4. Harden the schema in `data-model.md`

**Goal:** Fix the three schema traps while tables are still empty — uuidv7 defaults, the `linkClicks` tenancy exception, and the intentional no-FK note.
**Requirements:** R4, R5
**Dependencies:** none
**Files:** `docs/product-information/data-model.md`, `docs/pahses/phase-0-foundation.md` (Task 0.2 verification wording)
**Approach:**
- Change every `id: uuid("id").primaryKey()` to `.default(sql\`uuidv7()\`)` and update the schema notes: native PG18 `uuidv7()` (no extension, no JS lib), with the app-side `$defaultFn(() => uuidv7())` fallback noted for pre-18 local DBs. Add the caveat that schema files must not import from `"bun"` (drizzle-kit runs under Node).
- Document the `db/scoped.ts` escape hatch: `linkClicks` is public visitor traffic with no `user_id` and is reached via `link → project`; the scoped helper must expose an explicit opt-out for such tables rather than forcing a bogus `user_id`.
- Add a one-line note that `user_id` is `text` with no FK to BetterAuth's tables by design (Task 0.2 runs before Task 0.3), and that tenant integrity is enforced by the scoped helper, not a DB constraint.
- In `phase-0-foundation.md` Task 0.2, amend "verify every user-scoped table carries user_id" to name `linkClicks` as the documented exception.
**Patterns to follow:** the existing column-definition and `Notes` conventions in `data-model.md`; the `scoped.ts` intent described in `tech-architecture.md` (`Security → Multi-tenancy`).
**Test scenarios:**
- Happy path (already verified this session): `select uuidv7()` succeeds on the Neon database — confirmed live (PG18.4). Re-runnable via `bun -e` against `DATABASE_URL`.
- Spec check: `linkClicks` is the only table without a `userId` column and is called out as the scoped-helper exception.
**Verification:** every `id` default in `data-model.md` is `uuidv7()`; the `linkClicks` exception and no-FK rationale are documented; Task 0.2 wording names the exception.

### U5. Clean up doc rot

**Goal:** Fix the broken phases path, record the resolved remote prerequisite, and note the remaining hygiene items.
**Requirements:** R7, R8
**Dependencies:** U1, U3, U4 edit files under the phases folder — do this rename last (or first, then edit the new path consistently) to avoid split edits.
**Files:** `docs/pahses/` → `docs/phases/` (directory rename), `CLAUDE.md` (link targets + Next.js version note), `docs/pahses/phase-0-foundation.md` (Task 0.1 steps 1–2)
**Approach:**
- Rename the `docs/pahses/` directory to `docs/phases/` and confirm `CLAUDE.md`'s `docs/phases/` links resolve. The folder is currently untracked, so the rename is a clean add.
- In Task 0.1 step 1, reword the halt ("if not, say so and stop") to reflect that the remote already exists — verify-and-continue rather than stop.
- Leave step 2 (replace `AGENTS.md` with a CLAUDE.md pointer) as an execution-time action but note in the doc that the current `AGENTS.md`/`CLAUDE.md` version disagreement (Next.js 15+ vs installed 16.2.10) is the live example it resolves; bump the `CLAUDE.md` stack line to "Next.js 16+".
**Patterns to follow:** existing `CLAUDE.md` doc-table link format.
**Test scenarios:** Test expectation: none — file move + doc edits.
**Verification:** `docs/phases/phase-0-foundation.md` exists (no `pahses`); every `CLAUDE.md` link resolves; step 1 no longer instructs a stop; `CLAUDE.md` stack reads "Next.js 16+".

---

## Scope Boundaries

**In scope:** doc corrections to `phase-0-foundation.md` and the four source docs; schema hardening in `data-model.md`.

**Deferred to Follow-Up Work:**
- The Redis / `docker-compose.yml` self-host story — `open-source.md` implies both, but the runtime stack is Trigger.dev cloud (Node), not self-hosted Redis. Resolving that self-host-vs-cloud tension is a Phase 5 / self-hosting concern, not a Phase 0 blocker.
- Executing `AGENTS.md` → `CLAUDE.md` pointer replacement (happens during a real Task 0.1 run).

**Out of scope:** executing any Phase 0 task — no `bun install`, no `drizzle-kit` migrations, no auth/jobs/app-shell code. This plan corrects the instructions; `/ce-work` (or a manual Phase 0 run) executes them.

---

## Risks & Dependencies

- **`uuidv7()` pins the schema to PG18.** Fine on Neon (verified), but a local pre-18 Postgres for offline dev would reject it. Mitigated by documenting the app-side `$defaultFn` fallback in U4.
- **Directory rename touches files U1/U3/U4 also edit.** Sequence U5's rename cleanly (rename first, then all edits target `docs/phases/`, or rename last after edits) to avoid editing a path that moves mid-work.
- **No FK from `user_id` to BetterAuth tables** is intentional but means tenant integrity rests entirely on `db/scoped.ts`. U4 documents this; the helper's correctness is a Phase 0.2 execution concern, not resolved here.

---

## Sources / Research

- **Live verification (this session):** Neon smoke test — both `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct) returned `PostgreSQL 18.4`; `bun 1.2.21` present. Confirms native `uuidv7()` availability underpinning U4.
- **Framework research:** PG18 ships native `uuidv7()` (RFC 9562); Neon defaults new projects to PG18. `drizzle-orm#4469` — `Bun.randomUUIDv7` in schema files breaks `drizzle-kit` (Node). Tailwind v4 `dark:` defaults to `prefers-color-scheme` unless a `@custom-variant dark` overrides it; `@theme inline` preserves `var()` indirection so utilities flip under media queries; shadcn's Tailwind v4 init is class-based and recolors mostly via CSS-variable redefinition under `.dark`.
- **Pressure-test findings (in-session):** the 12 findings against `phase-0-foundation.md`, grouped by when they bite; each cited to a source-doc line during the review.
