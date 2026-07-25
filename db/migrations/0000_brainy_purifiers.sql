CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TYPE "public"."archetype" AS ENUM('shipped_this', 'lesson_learned', 'hot_take', 'origin_story', 'how_it_works', 'comparison', 'question', 'launch');--> statement-breakpoint
CREATE TYPE "public"."channel_health" AS ENUM('healthy', 'expiring', 'needs_reauth', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."draft_status" AS ENUM('generated', 'approved', 'rejected', 'edited');--> statement-breakpoint
CREATE TYPE "public"."knowledge_category" AS ENUM('feature', 'benefit', 'problem', 'origin_story', 'technical_detail', 'pricing', 'social_proof', 'update');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('x', 'linkedin', 'reddit', 'instagram', 'tiktok');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('queued', 'publishing', 'published', 'held', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('site_crawl', 'rss', 'brain_dump', 'github_releases');--> statement-breakpoint
CREATE TABLE "brand_profiles" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"what_it_does" text NOT NULL,
	"whos_its_for" text NOT NULL,
	"problem_solved" text NOT NULL,
	"category" text,
	"competitors" jsonb DEFAULT '[]'::jsonb,
	"vocabulary" jsonb DEFAULT '[]'::jsonb,
	"avoid_terms" jsonb DEFAULT '[]'::jsonb,
	"tone_markers" jsonb DEFAULT '[]'::jsonb,
	"crawled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "channels" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"platform" "platform" NOT NULL,
	"handle" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"platform_user_id" text NOT NULL,
	"postpeer_account_id" text,
	"access_token_enc" text,
	"refresh_token_enc" text,
	"token_expires_at" timestamp with time zone,
	"health" "channel_health" DEFAULT 'healthy' NOT NULL,
	"last_error_at" timestamp with time zone,
	"last_error_message" text,
	"reddit_karma" integer,
	"reddit_account_age_days" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drafts" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"idea_id" uuid,
	"project_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"platform" "platform" NOT NULL,
	"body" text NOT NULL,
	"title" text,
	"link_url" text,
	"media_keys" jsonb DEFAULT '[]'::jsonb,
	"thread_parts" jsonb,
	"status" "draft_status" DEFAULT 'generated' NOT NULL,
	"original_body" text,
	"edit_distance" real,
	"slop_score" real,
	"target_subreddit" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ideas" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"angle" text NOT NULL,
	"archetype" "archetype" NOT NULL,
	"knowledge_item_ids" jsonb NOT NULL,
	"embedding" vector(1536),
	"is_used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_items" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"project_id" uuid NOT NULL,
	"source_id" uuid,
	"user_id" text NOT NULL,
	"fact" text NOT NULL,
	"category" "knowledge_category" NOT NULL,
	"specificity" real DEFAULT 0.5 NOT NULL,
	"source_url" text,
	"source_quote" text,
	"embedding" vector(1536),
	"times_used" integer DEFAULT 0 NOT NULL,
	"last_used_at" timestamp with time zone,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "link_clicks" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"link_id" uuid NOT NULL,
	"clicked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"country" text,
	"referrer" text,
	"user_agent_hash" text
);
--> statement-breakpoint
CREATE TABLE "links" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"slug" text NOT NULL,
	"destination_url" text NOT NULL,
	"scheduled_post_id" uuid,
	"click_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"autopilot" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "safety_checks" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"scheduled_post_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"check_name" text NOT NULL,
	"passed" boolean NOT NULL,
	"detail" text,
	"ran_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_posts" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"draft_id" uuid NOT NULL,
	"channel_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"status" "post_status" DEFAULT 'queued' NOT NULL,
	"idempotency_key" text NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"platform_post_id" text,
	"permalink" text,
	"reply_post_id" text,
	"hold_reason" text,
	"error_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"channel_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"days_of_week" jsonb DEFAULT '[1,2,3,4,5]'::jsonb NOT NULL,
	"times_of_day" jsonb DEFAULT '["09:00"]'::jsonb NOT NULL,
	"jitter_minutes" integer DEFAULT 7 NOT NULL,
	"is_paused" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"type" "source_type" NOT NULL,
	"url" text,
	"label" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_polled_at" timestamp with time zone,
	"last_cursor" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subreddit_targets" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"subscribers" integer,
	"rules_text" jsonb,
	"allows_self_promo" boolean,
	"min_karma" integer,
	"min_account_age_days" integer,
	"requires_flair" boolean DEFAULT false,
	"available_flairs" jsonb,
	"cooldown_days" integer DEFAULT 7 NOT NULL,
	"rules_fetched_at" timestamp with time zone,
	"last_posted_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" text NOT NULL,
	"dodo_subscription_id" text,
	"dodo_customer_id" text,
	"plan" text DEFAULT 'trial' NOT NULL,
	"status" text DEFAULT 'trialing' NOT NULL,
	"current_period_end" timestamp with time zone,
	"trial_posts_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_counters" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" text NOT NULL,
	"project_id" uuid,
	"period_start" timestamp with time zone NOT NULL,
	"posts_published" integer DEFAULT 0 NOT NULL,
	"llm_input_tokens" integer DEFAULT 0 NOT NULL,
	"llm_output_tokens" integer DEFAULT 0 NOT NULL,
	"postpeer_credits" integer DEFAULT 0 NOT NULL,
	"firecrawl_pages" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voice_profiles" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"summary" text NOT NULL,
	"traits" jsonb,
	"examples" jsonb DEFAULT '[]'::jsonb,
	"sampled_from" jsonb DEFAULT '[]'::jsonb,
	"posts_sampled" integer DEFAULT 0,
	"refreshed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "brand_profiles" ADD CONSTRAINT "brand_profiles_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channels" ADD CONSTRAINT "channels_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "link_clicks" ADD CONSTRAINT "link_clicks_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_scheduled_post_id_scheduled_posts_id_fk" FOREIGN KEY ("scheduled_post_id") REFERENCES "public"."scheduled_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_checks" ADD CONSTRAINT "safety_checks_scheduled_post_id_scheduled_posts_id_fk" FOREIGN KEY ("scheduled_post_id") REFERENCES "public"."scheduled_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_posts" ADD CONSTRAINT "scheduled_posts_draft_id_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_posts" ADD CONSTRAINT "scheduled_posts_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subreddit_targets" ADD CONSTRAINT "subreddit_targets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_profiles" ADD CONSTRAINT "voice_profiles_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "brand_profiles_project_idx" ON "brand_profiles" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "channels_project_idx" ON "channels" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "channels_platform_user_idx" ON "channels" USING btree ("project_id","platform","platform_user_id");--> statement-breakpoint
CREATE INDEX "drafts_project_status_idx" ON "drafts" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "ideas_project_idx" ON "ideas" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "knowledge_project_idx" ON "knowledge_items" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "knowledge_used_idx" ON "knowledge_items" USING btree ("project_id","times_used");--> statement-breakpoint
CREATE INDEX "link_clicks_link_idx" ON "link_clicks" USING btree ("link_id","clicked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "links_slug_idx" ON "links" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "projects_user_idx" ON "projects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "safety_checks_post_idx" ON "safety_checks" USING btree ("scheduled_post_id");--> statement-breakpoint
CREATE UNIQUE INDEX "scheduled_posts_idem_idx" ON "scheduled_posts" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "scheduled_posts_due_idx" ON "scheduled_posts" USING btree ("status","scheduled_for");--> statement-breakpoint
CREATE INDEX "scheduled_posts_project_idx" ON "scheduled_posts" USING btree ("project_id","scheduled_for");--> statement-breakpoint
CREATE UNIQUE INDEX "schedules_channel_idx" ON "schedules" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "sources_project_idx" ON "sources" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subreddit_project_name_idx" ON "subreddit_targets" USING btree ("project_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_user_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "usage_user_period_idx" ON "usage_counters" USING btree ("user_id","period_start");--> statement-breakpoint
CREATE UNIQUE INDEX "voice_profiles_project_idx" ON "voice_profiles" USING btree ("project_id");