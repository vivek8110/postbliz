// db/schema.ts
// Source of truth for the schema is docs/product-information/data-model.md.
// Update that doc in the same commit as any change here.
//
// `users`, `sessions`, `accounts`, `verifications` are owned by BetterAuth
// (Task 0.3). Do not hand-write them; use its Drizzle adapter. `user_id` here
// is `text` with no FK — tenant integrity is enforced by db/scoped.ts.
//
// Every `id` uses native `uuidv7()` (Neon runs PG18) for sortable IDs — no
// extension, no JS library. Do NOT import from "bun" in this file: drizzle-kit
// runs under Node.
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
  "queued", "publishing", "published", "held", "failed", "cancelled",
]);

export const channelHealthEnum = pgEnum("channel_health", [
  "healthy", "expiring", "needs_reauth", "revoked",
]);

/* ─── users & projects ──────────────────────────────────── */

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  timezone: text("timezone").notNull().default("UTC"), // IANA
  isActive: boolean("is_active").notNull().default(true),
  autopilot: boolean("autopilot").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("projects_user_idx").on(t.userId)]);

/* ─── understanding the product ─────────────────────────── */

export const brandProfiles = pgTable("brand_profiles", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),

  whatItDoes: text("what_it_does").notNull(),
  whoItsFor: text("whos_its_for").notNull(),
  problemSolved: text("problem_solved").notNull(),
  category: text("category"),
  competitors: jsonb("competitors").$type<string[]>().default([]),
  vocabulary: jsonb("vocabulary").$type<string[]>().default([]),
  avoidTerms: jsonb("avoid_terms").$type<string[]>().default([]),
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

  summary: text("summary").notNull(),
  traits: jsonb("traits").$type<{
    sentenceLength: "short" | "medium" | "long";
    formality: number;
    emojiUse: "none" | "sparse" | "frequent";
    usesHashtags: boolean;
    capitalisation: "standard" | "lowercase" | "mixed";
    signaturePhrases: string[];
    avoids: string[];
  }>(),
  examples: jsonb("examples").$type<{
    platform: string; text: string; engagement?: number;
  }[]>().default([]),

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
  url: text("url"),
  label: text("label"),
  isActive: boolean("is_active").notNull().default(true),
  lastPolledAt: timestamp("last_polled_at", { withTimezone: true }),
  lastCursor: text("last_cursor"),
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
  specificity: real("specificity").notNull().default(0.5),
  sourceUrl: text("source_url"),
  sourceQuote: text("source_quote"),
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

  postpeerAccountId: text("postpeer_account_id"),
  // direct for reddit — ALWAYS encrypted, see lib/crypto.ts
  accessTokenEnc: text("access_token_enc"),
  refreshTokenEnc: text("refresh_token_enc"),
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),

  health: channelHealthEnum("health").notNull().default("healthy"),
  lastErrorAt: timestamp("last_error_at", { withTimezone: true }),
  lastErrorMessage: text("last_error_message"),

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
  daysOfWeek: jsonb("days_of_week").$type<number[]>().notNull().default([1, 2, 3, 4, 5]), // 0=Sun
  timesOfDay: jsonb("times_of_day").$type<string[]>().notNull().default(["09:00"]),        // local HH:mm
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
  knowledgeItemIds: jsonb("knowledge_item_ids").$type<string[]>().notNull(),
  embedding: vector("embedding", { dimensions: 1536 }),
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
  originalBody: text("original_body"),
  editDistance: real("edit_distance"),
  slopScore: real("slop_score"),

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

  holdReason: text("hold_reason"),
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

// The one table with no user_id — public visitor traffic, reached via link → project.
// db/scoped.ts treats it as the documented tenant-scoping exception.
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
