CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"totp_secret" varchar(255),
	"totp_enabled" boolean DEFAULT false NOT NULL,
	"must_change_password" boolean DEFAULT true NOT NULL,
	"last_login" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"locale" varchar(5) NOT NULL,
	"title" varchar(500) NOT NULL,
	"excerpt" text,
	"body" text NOT NULL,
	"cover_image_url" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chatbot_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(100) NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_qualified" boolean DEFAULT false NOT NULL,
	"contact_submission_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"access_token" varchar(64) NOT NULL,
	"client_name" varchar(255) NOT NULL,
	"client_email" varchar(255),
	"project_title" varchar(500) NOT NULL,
	"locale" varchar(5) DEFAULT 'en' NOT NULL,
	"status" varchar(30) DEFAULT 'not_started' NOT NULL,
	"progress_pct" integer DEFAULT 0 NOT NULL,
	"start_date" date,
	"estimated_end_date" date,
	"total_price_cents" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"notes_for_client" text,
	"internal_notes" text,
	"notify_on_update" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_projects_status_check" CHECK ("client_projects"."status" IN ('not_started', 'in_progress', 'review', 'completed')),
	CONSTRAINT "client_projects_progress_check" CHECK ("client_projects"."progress_pct" >= 0 AND "client_projects"."progress_pct" <= 100)
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"project_type" varchar(100),
	"message" text NOT NULL,
	"source" varchar(50) DEFAULT 'website' NOT NULL,
	"is_qualified" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contact_submissions_source_check" CHECK ("contact_submissions"."source" IN ('website', 'chatbot', 'referral'))
);
--> statement-breakpoint
CREATE TABLE "page_contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_key" varchar(100) NOT NULL,
	"locale" varchar(5) NOT NULL,
	"title" text,
	"body" jsonb NOT NULL,
	"meta_title" varchar(255),
	"meta_description" text,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" jsonb NOT NULL,
	"description" jsonb NOT NULL,
	"category" varchar(50) NOT NULL,
	"thumbnail_url" text NOT NULL,
	"demo_url" text,
	"tech_stack" text[] NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "portfolio_projects_category_check" CHECK ("portfolio_projects"."category" IN ('showcase', 'business', 'webapp', 'saas'))
);
--> statement-breakpoint
CREATE TABLE "pricing_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"label" jsonb NOT NULL,
	"is_included" boolean DEFAULT true NOT NULL,
	"tooltip" jsonb,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb NOT NULL,
	"price_usd" integer NOT NULL,
	"price_htg" integer,
	"price_eur" integer,
	"price_cad" integer,
	"billing_type" varchar(20) NOT NULL,
	"is_popular" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pricing_plans_billing_check" CHECK ("pricing_plans"."billing_type" IN ('one_time', 'monthly', 'custom'))
);
--> statement-breakpoint
CREATE TABLE "project_deliverables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"label" varchar(255) NOT NULL,
	"file_url" text,
	"external_url" text,
	"delivered_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"sender_type" varchar(10) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_messages_sender_check" CHECK ("project_messages"."sender_type" IN ('admin', 'client'))
);
--> statement-breakpoint
CREATE TABLE "project_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"due_date" date,
	"completed_at" timestamp with time zone,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_milestones_status_check" CHECK ("project_milestones"."status" IN ('pending', 'in_progress', 'completed'))
);
--> statement-breakpoint
ALTER TABLE "chatbot_conversations" ADD CONSTRAINT "chatbot_conversations_contact_submission_id_contact_submissions_id_fk" FOREIGN KEY ("contact_submission_id") REFERENCES "public"."contact_submissions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_features" ADD CONSTRAINT "pricing_features_plan_id_pricing_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."pricing_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_deliverables" ADD CONSTRAINT "project_deliverables_project_id_client_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."client_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_messages" ADD CONSTRAINT "project_messages_project_id_client_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."client_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_project_id_client_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."client_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_uniq" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "blog_posts_slug_locale_uniq" ON "blog_posts" USING btree ("slug","locale");--> statement-breakpoint
CREATE INDEX "blog_posts_published_idx" ON "blog_posts" USING btree ("is_published","published_at");--> statement-breakpoint
CREATE INDEX "chatbot_conversations_session_idx" ON "chatbot_conversations" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "chatbot_conversations_qualified_idx" ON "chatbot_conversations" USING btree ("is_qualified","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "client_projects_token_uniq" ON "client_projects" USING btree ("access_token");--> statement-breakpoint
CREATE INDEX "client_projects_active_idx" ON "client_projects" USING btree ("is_active","updated_at");--> statement-breakpoint
CREATE INDEX "contact_submissions_inbox_idx" ON "contact_submissions" USING btree ("is_archived","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "page_contents_key_locale_uniq" ON "page_contents" USING btree ("page_key","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "portfolio_projects_slug_uniq" ON "portfolio_projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "portfolio_projects_category_idx" ON "portfolio_projects" USING btree ("category");--> statement-breakpoint
CREATE INDEX "portfolio_projects_published_order_idx" ON "portfolio_projects" USING btree ("is_published","display_order");--> statement-breakpoint
CREATE INDEX "pricing_features_plan_idx" ON "pricing_features" USING btree ("plan_id","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "pricing_plans_slug_uniq" ON "pricing_plans" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "pricing_plans_active_order_idx" ON "pricing_plans" USING btree ("is_active","display_order");--> statement-breakpoint
CREATE INDEX "project_deliverables_project_idx" ON "project_deliverables" USING btree ("project_id","delivered_at");--> statement-breakpoint
CREATE INDEX "project_messages_project_idx" ON "project_messages" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "project_milestones_project_order_idx" ON "project_milestones" USING btree ("project_id","display_order");