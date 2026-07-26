# Data Model

Drizzle + Postgres (Neon). This file is the **source of truth for the schema.** Update it in the same
commit as any migration.

## Entity map

```
user
 └── project                    one product being promoted
      ├── brand_profile         1:1  what the product is
      ├── voice_profile         1:1  how the founder writes (cached)
      ├── source                1:N  crawl / rss / brain_dump
      │    └── knowledge_item   1:N  a fact, with provenance
      ├── channel               1:N  a connected social account
      │    └── schedule         1:1  cadence for that channel
      ├── idea                  1:N  an angle, pre-writing
      │    └── draft            1:N  platform-specific written content
      │         └── scheduled_post   1:1  the publish record
      ├── subreddit_target      1:N  chosen subs + cached rules
      └── link                  1:N  short links + clicks
```

## Conventions

- Tables `snake_case` plural. Drizzle exports `camelCase`.
- Every table: `id` (uuid v7 via native `uuidv7()` for sortability), `created_at`, `updated_at`.
- Every user-scoped table carries `user_id` even when reachable via a parent — enables a single
  scoped-query helper and prevents cross-tenant leaks.
- Timestamps `timestamptz`, always UTC in the DB. Convert at the edge to the user's IANA zone.
- Enums as pgEnum, not text. Bad states should be unrepresentable.
- Soft-delete only where a user would expect undo (`drafts`, `ideas`). Everything else hard-deletes.

---

## Schema

```ts
// db/schema.ts
import { sql } from "drizzle-orm";
import {
  pgTable, pgEnum, text, timestamp, integer, boolean,
  jsonb, uuid, index, uniqueIndex, real, vector,
} from "drizzle-orm/pg-core";

/* ─── enums ─────────────────────────────────────────────── */

export const platformEnum = pgEnum("platform", [
  "x", "linkedin", "reddit", "instagram", "tiktok",
]);

export const sourceTypeEnum = pgEnum("source_type", [
  "site_crawl", "rss", "brain_dump", "github_releases",
]);

export const knowledgeCategoryEnum = pgEnum("knowledge_category", [
  "feature", "benefit", "problem", "origin_story",
  "technical_detail", "pricing", "social_proof", "update",
]);

export const archetypeEnum = pgEnum("archetype", [
  "shipped_this", "lesson_learned", "hot_take", "origin_story",
  "how_it_works", "comparison", "question", "launch",
]);

export const draftStatusEnum = pgEnum("draft_status", [
  "generated", "approved", "rejected", "edited",
]);

export const postStatusEnum = pgEnum("post_status", [
  "queued",      // waiting for fire time
  "publishing",  // claimed by a worker — the retry guard
  "published",
  "held",        // failed a safety check or a permanent error
  "failed",      // retries exhausted
  "cancelled",
]);

export const channelHealthEnum = pgEnum("channel_health", [
  "healthy", "expiring", "needs_reauth", "revoked",
]);

/* ─── users & projects ──────────────────────────────────── */
// `users`, `sessions`, `accounts`, `verifications` are owned by BetterAuth.
// Do not hand-write them; use its Drizzle adapter.

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  timezone: text("timezone").notNull().default("UTC"), // IANA
  isActive: boolean("is_active").notNull().default(true),
  autopilot: boolean("autopilot").notNull().default(false),
  thinContent: boolean("thin_content").notNull().default(false), // crawl median specificity < 0.5 → prompt for a brain dump
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("projects_user_idx").on(t.userId)]);

/* ─── understanding the product ─────────────────────────── */

export const brandProfiles = pgTable("brand_profiles", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),

  // extracted once at onboarding, editable by the user
  whatItDoes: text("what_it_does").notNull(),
  whoItsFor: text("whos_its_for").notNull(),
  problemSolved: text("problem_solved").notNull(),
  category: text("category"),
  competitors: jsonb("competitors").$type<string[]>().default([]),
  vocabulary: jsonb("vocabulary").$type<string[]>().default([]),   // terms to use
  avoidTerms: jsonb("avoid_terms").$type<string[]>().default([]),  // terms never to use
  toneMarkers: jsonb("tone_markers").$type<string[]>().default([]),

  crawledAt: timestamp("crawled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("brand_profiles_project_idx").on(t.projectId)]);

// The "memory file" — fetched once, cached, refreshed monthly. NEVER per post.
export const voiceProfiles = pgTable("voice_profiles", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),

  summary: text("summary").notNull(),                        // prose description of how they write
  traits: jsonb("traits").$type<{
    sentenceLength: "short" | "medium" | "long";
    formality: number;        // 0 casual … 1 formal
    emojiUse: "none" | "sparse" | "frequent";
    usesHashtags: boolean;
    capitalisation: "standard" | "lowercase" | "mixed";
    signaturePhrases: string[];
    avoids: string[];
  }>(),
  examples: jsonb("examples").$type<{
    platform: string; text: string; engagement?: number;
  }[]>().default([]),                                        // 10–20 few-shot examples

  sampledFrom: jsonb("sampled_from").$type<string[]>().default([]),
  postsSampled: integer("posts_sampled").default(0),
  refreshedAt: timestamp("refreshed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("voice_profiles_project_idx").on(t.projectId)]);

/* ─── sources & knowledge ───────────────────────────────── */

export const sources = pgTable("sources", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  type: sourceTypeEnum("type").notNull(),
  url: text("url"),                                    // null for brain_dump
  label: text("label"),
  isActive: boolean("is_active").notNull().default(true),
  lastPolledAt: timestamp("last_polled_at", { withTimezone: true }),
  lastCursor: text("last_cursor"),                     // RSS guid / release tag
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("sources_project_idx").on(t.projectId)]);

// One discrete, checkable fact. Rule 6: no post exists without one of these.
export const knowledgeItems = pgTable("knowledge_items", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
  userId: text("user_id").notNull(),

  fact: text("fact").notNull(),
  category: knowledgeCategoryEnum("category").notNull(),
  specificity: real("specificity").notNull().default(0.5), // 0 generic … 1 concrete. Prefer high
  sourceUrl: text("source_url"),
  sourceQuote: text("source_quote"),                       // provenance the user can verify
  embedding: vector("embedding", { dimensions: 1536 }),

  timesUsed: integer("times_used").notNull().default(0),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("knowledge_project_idx").on(t.projectId),
  index("knowledge_used_idx").on(t.projectId, t.timesUsed),
]);

/* ─── channels & scheduling ─────────────────────────────── */

export const channels = pgTable("channels", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  platform: platformEnum("platform").notNull(),

  handle: text("handle").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  platformUserId: text("platform_user_id").notNull(),

  // PostPeer-managed for x/linkedin/instagram/tiktok
  postpeerAccountId: text("postpeer_account_id"),
  // direct for reddit — ALWAYS encrypted, see lib/crypto.ts
  accessTokenEnc: text("access_token_enc"),
  refreshTokenEnc: text("refresh_token_enc"),
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),

  health: channelHealthEnum("health").notNull().default("healthy"),
  lastErrorAt: timestamp("last_error_at", { withTimezone: true }),
  lastErrorMessage: text("last_error_message"),

  // reddit-only, drives the safety gate
  redditKarma: integer("reddit_karma"),
  redditAccountAgeDays: integer("reddit_account_age_days"),

  isActive: boolean("is_active").notNull().default(true),
  connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("channels_project_idx").on(t.projectId),
  uniqueIndex("channels_platform_user_idx").on(t.projectId, t.platform, t.platformUserId),
]);

export const schedules = pgTable("schedules", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  channelId: uuid("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  daysOfWeek: jsonb("days_of_week").$type<number[]>().notNull().default([1,2,3,4,5]), // 0=Sun
  timesOfDay: jsonb("times_of_day").$type<string[]>().notNull().default(["09:00"]),   // local HH:mm
  jitterMinutes: integer("jitter_minutes").notNull().default(7),
  isPaused: boolean("is_paused").notNull().default(false),
}, (t) => [uniqueIndex("schedules_channel_idx").on(t.channelId)]);

/* ─── ideas → drafts → scheduled posts ──────────────────── */

export const ideas = pgTable("ideas", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  angle: text("angle").notNull(),
  archetype: archetypeEnum("archetype").notNull(),
  knowledgeItemIds: jsonb("knowledge_item_ids").$type<string[]>().notNull(), // provenance
  embedding: vector("embedding", { dimensions: 1536 }),                       // 90-day dedupe
  isUsed: boolean("is_used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("ideas_project_idx").on(t.projectId)]);

export const drafts = pgTable("drafts", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  ideaId: uuid("idea_id").references(() => ideas.id, { onDelete: "set null" }),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  platform: platformEnum("platform").notNull(),

  body: text("body").notNull(),
  title: text("title"),                    // reddit only
  linkUrl: text("link_url"),               // NEVER inlined into an X body — goes in the reply
  mediaKeys: jsonb("media_keys").$type<string[]>().default([]), // R2 keys
  threadParts: jsonb("thread_parts").$type<string[]>(),         // X threads

  status: draftStatusEnum("status").notNull().default("generated"),
  originalBody: text("original_body"),     // pre-edit, for edit-distance
  editDistance: real("edit_distance"),     // 0 = untouched. Your best quality signal
  slopScore: real("slop_score"),           // anti-slop reviewer output, 0 good … 1 bad

  targetSubreddit: text("target_subreddit"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("drafts_project_status_idx").on(t.projectId, t.status)]);

export const scheduledPosts = pgTable("scheduled_posts", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  draftId: uuid("draft_id").notNull().references(() => drafts.id, { onDelete: "cascade" }),
  channelId: uuid("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").notNull(),
  userId: text("user_id").notNull(),

  scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
  status: postStatusEnum("status").notNull().default("queued"),

  // Rule 5. Unique constraint + claim-row-first = no double posts, ever.
  idempotencyKey: text("idempotency_key").notNull(),

  attemptCount: integer("attempt_count").notNull().default(0),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  platformPostId: text("platform_post_id"),
  permalink: text("permalink"),
  replyPostId: text("reply_post_id"),      // the X link-reply

  holdReason: text("hold_reason"),         // plain language, shown to the user
  errorCode: text("error_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("scheduled_posts_idem_idx").on(t.idempotencyKey),
  index("scheduled_posts_due_idx").on(t.status, t.scheduledFor),
  index("scheduled_posts_project_idx").on(t.projectId, t.scheduledFor),
]);

/* ─── reddit ────────────────────────────────────────────── */

export const subredditTargets = pgTable("subreddit_targets", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),            // without r/

  subscribers: integer("subscribers"),
  rulesText: jsonb("rules_text").$type<{ title: string; description: string }[]>(),
  allowsSelfPromo: boolean("allows_self_promo"),
  minKarma: integer("min_karma"),
  minAccountAgeDays: integer("min_account_age_days"),
  requiresFlair: boolean("requires_flair").default(false),
  availableFlairs: jsonb("available_flairs").$type<{ id: string; text: string }[]>(),
  cooldownDays: integer("cooldown_days").notNull().default(7),

  rulesFetchedAt: timestamp("rules_fetched_at", { withTimezone: true }),
  lastPostedAt: timestamp("last_posted_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
}, (t) => [uniqueIndex("subreddit_project_name_idx").on(t.projectId, t.name)]);

// Every gate run, pass or fail. Audit trail + the UI explanation.
export const safetyChecks = pgTable("safety_checks", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  scheduledPostId: uuid("scheduled_post_id").notNull()
    .references(() => scheduledPosts.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  checkName: text("check_name").notNull(),   // see reddit-safety.md
  passed: boolean("passed").notNull(),
  detail: text("detail"),
  ranAt: timestamp("ran_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("safety_checks_post_idx").on(t.scheduledPostId)]);

/* ─── attribution ───────────────────────────────────────── */

export const links = pgTable("links", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  slug: text("slug").notNull(),
  destinationUrl: text("destination_url").notNull(),
  scheduledPostId: uuid("scheduled_post_id").references(() => scheduledPosts.id),
  clickCount: integer("click_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("links_slug_idx").on(t.slug)]);

export const linkClicks = pgTable("link_clicks", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  linkId: uuid("link_id").notNull().references(() => links.id, { onDelete: "cascade" }),
  clickedAt: timestamp("clicked_at", { withTimezone: true }).notNull().defaultNow(),
  country: text("country"),
  referrer: text("referrer"),
  userAgentHash: text("user_agent_hash"),  // hashed — do not store raw UA or IP
}, (t) => [index("link_clicks_link_idx").on(t.linkId, t.clickedAt)]);

/* ─── billing & limits ──────────────────────────────────── */

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  userId: text("user_id").notNull(),
  dodoSubscriptionId: text("dodo_subscription_id"),
  dodoCustomerId: text("dodo_customer_id"),
  plan: text("plan").notNull().default("trial"),   // trial | solo | pro | studio
  status: text("status").notNull().default("trialing"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  trialPostsUsed: integer("trial_posts_used").notNull().default(0), // cap 10, all platforms
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("subscriptions_user_idx").on(t.userId)]);

// Rolling monthly counters. Enforce limits AND watch COGS.
export const usageCounters = pgTable("usage_counters", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  userId: text("user_id").notNull(),
  projectId: uuid("project_id"),
  periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
  postsPublished: integer("posts_published").notNull().default(0),
  llmInputTokens: integer("llm_input_tokens").notNull().default(0),
  llmOutputTokens: integer("llm_output_tokens").notNull().default(0),
  postpeerCredits: integer("postpeer_credits").notNull().default(0),
  firecrawlPages: integer("firecrawl_pages").notNull().default(0),
}, (t) => [uniqueIndex("usage_user_period_idx").on(t.userId, t.periodStart)]);
```

---

## Notes on tricky parts

**`vector` columns** need `CREATE EXTENSION vector;` on Neon — supported, enable it in the first
migration. Used for 90-day dedupe of ideas and knowledge items. An IVFFlat index is unnecessary
below ~100k rows.

**`id` defaults — `uuidv7()`.** Every `id` uses `.default(sql`uuidv7()`)`. Postgres 18 ships a native
`uuidv7()` and Neon runs PG18, so IDs are time-sortable with no extension and no JS library. Do
**not** import `Bun.randomUUIDv7` into this file — `drizzle-kit` runs under Node and can't resolve
`"bun"`. For a pre-18 local Postgres, fall back to an app-side default: `.$defaultFn(() => uuidv7())`
from the `uuid` npm package.

**Tenancy has no FK.** `user_id` is `text` with no foreign key to BetterAuth's `users` table — the app
schema (Task 0.2) migrates before BetterAuth's tables exist (Task 0.3). Tenant integrity is enforced
by `db/scoped.ts`, which forces a `user_id` filter on every user-scoped query, not by a DB constraint.

**`link_clicks` is the one table with no `user_id`.** It's public visitor traffic reached via
`link → project`, so `db/scoped.ts` must expose an explicit opt-out for it (and any future non-tenant
table) rather than forcing a bogus `user_id`. It is the documented exception to "every user-scoped
table carries `user_id`."

**`idempotencyKey`** format: `{scheduledPostId}:{channelId}:{attempt-independent}`. It must **not**
include the attempt number, or retries would generate new keys and defeat the whole mechanism.

**`editDistance`** — normalised Levenshtein between `originalBody` and `body`. Watch the median in
PostHog. If it climbs above ~0.3, generation quality is degrading and it will show up in churn about
three weeks later.

**`specificity`** on knowledge items — the model self-scores how concrete a fact is. Bias idea
generation toward high scores. "Supports dark mode" beats "is easy to use," always.

**Never store raw IPs or user agents** on link clicks. Hash them. You're a public repo processing
third-party visitor traffic; keep the GDPR surface at zero.

## Related

- [`tech-architecture.md`](tech-architecture.md) — how these are used
- [`reddit-safety.md`](reddit-safety.md) — what `safety_checks` records
- [`content-system.md`](content-system.md) — the knowledge → idea → draft pipeline
