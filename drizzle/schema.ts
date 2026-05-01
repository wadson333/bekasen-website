/**
 * Bekasen — Drizzle ORM schema
 *
 * 12 tables per the technical specification:
 *   admin_users, page_contents, portfolio_projects, pricing_plans,
 *   pricing_features, blog_posts, client_projects, project_milestones,
 *   project_messages, project_deliverables, contact_submissions,
 *   chatbot_conversations.
 *
 * Conventions:
 *   - UUID primary keys via `gen_random_uuid()` (requires pgcrypto / pg17 builtin).
 *   - All tables have `created_at`, most have `updated_at`.
 *   - Multi-locale strings stored as JSONB shaped { en, fr, ht, es }.
 *   - Money stored in INTEGER cents (USD/HTG/EUR/CAD).
 *   - Soft-delete via `is_active` / `is_published` flags. No hard deletes from CMS.
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  date,
  jsonb,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ──────────────────────────────────────────────────────────────────────────────
// Reusable column factories
// ──────────────────────────────────────────────────────────────────────────────
const id = () =>
  uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`);

const createdAt = () =>
  timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`);

const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`);

// Shared shape for multi-locale strings: { en, fr, ht, es }
export type LocalizedString = {
  en: string;
  fr: string;
  ht: string;
  es: string;
};

// ──────────────────────────────────────────────────────────────────────────────
// 4.1 Admin Users
// ──────────────────────────────────────────────────────────────────────────────
export const adminUsers = pgTable(
  "admin_users",
  {
    id: id(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    totpSecret: varchar("totp_secret", { length: 255 }),
    totpEnabled: boolean("totp_enabled").notNull().default(false),
    mustChangePassword: boolean("must_change_password").notNull().default(true),
    lastLogin: timestamp("last_login", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("admin_users_email_uniq").on(t.email)],
);

// ──────────────────────────────────────────────────────────────────────────────
// 4.2 Page Contents (CMS-editable copy, hybrid with messages/*.json)
// ──────────────────────────────────────────────────────────────────────────────
export const pageContents = pgTable(
  "page_contents",
  {
    id: id(),
    pageKey: varchar("page_key", { length: 100 }).notNull(),
    locale: varchar("locale", { length: 5 }).notNull(),
    title: text("title"),
    body: jsonb("body").notNull().$type<{
      blocks: Array<{ type: string; content?: unknown; [k: string]: unknown }>;
    }>(),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("page_contents_key_locale_uniq").on(t.pageKey, t.locale),
  ],
);

// ──────────────────────────────────────────────────────────────────────────────
// 4.3 Portfolio Projects
// ──────────────────────────────────────────────────────────────────────────────
export const portfolioProjects = pgTable(
  "portfolio_projects",
  {
    id: id(),
    slug: varchar("slug", { length: 255 }).notNull(),
    title: jsonb("title").notNull().$type<LocalizedString>(),
    description: jsonb("description").notNull().$type<LocalizedString>(),
    category: varchar("category", { length: 50 }).notNull(),
    thumbnailUrl: text("thumbnail_url").notNull(),
    demoUrl: text("demo_url"),
    techStack: text("tech_stack").array().notNull(),
    isFeatured: boolean("is_featured").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("portfolio_projects_slug_uniq").on(t.slug),
    index("portfolio_projects_category_idx").on(t.category),
    index("portfolio_projects_published_order_idx").on(
      t.isPublished,
      t.displayOrder,
    ),
    check(
      "portfolio_projects_category_check",
      sql`${t.category} IN ('showcase', 'business', 'webapp', 'saas')`,
    ),
  ],
);

// ──────────────────────────────────────────────────────────────────────────────
// 4.4 Pricing Plans
// ──────────────────────────────────────────────────────────────────────────────
export const pricingPlans = pgTable(
  "pricing_plans",
  {
    id: id(),
    slug: varchar("slug", { length: 100 }).notNull(),
    name: jsonb("name").notNull().$type<LocalizedString>(),
    description: jsonb("description").notNull().$type<LocalizedString>(),
    priceUsd: integer("price_usd").notNull(),
    priceHtg: integer("price_htg"),
    priceEur: integer("price_eur"),
    priceCad: integer("price_cad"),
    billingType: varchar("billing_type", { length: 20 }).notNull(),
    isPopular: boolean("is_popular").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("pricing_plans_slug_uniq").on(t.slug),
    index("pricing_plans_active_order_idx").on(t.isActive, t.displayOrder),
    check(
      "pricing_plans_billing_check",
      sql`${t.billingType} IN ('one_time', 'monthly', 'custom')`,
    ),
  ],
);

// ──────────────────────────────────────────────────────────────────────────────
// 4.5 Pricing Features
// ──────────────────────────────────────────────────────────────────────────────
export const pricingFeatures = pgTable(
  "pricing_features",
  {
    id: id(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => pricingPlans.id, { onDelete: "cascade" }),
    label: jsonb("label").notNull().$type<LocalizedString>(),
    isIncluded: boolean("is_included").notNull().default(true),
    tooltip: jsonb("tooltip").$type<LocalizedString>(),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("pricing_features_plan_idx").on(t.planId, t.displayOrder)],
);

// ──────────────────────────────────────────────────────────────────────────────
// 4.6 Blog Posts (markdown, per-locale rows)
// ──────────────────────────────────────────────────────────────────────────────
export const blogPosts = pgTable(
  "blog_posts",
  {
    id: id(),
    slug: varchar("slug", { length: 255 }).notNull(),
    locale: varchar("locale", { length: 5 }).notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    excerpt: text("excerpt"),
    body: text("body").notNull(),
    coverImageUrl: text("cover_image_url"),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    isPublished: boolean("is_published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("blog_posts_slug_locale_uniq").on(t.slug, t.locale),
    index("blog_posts_published_idx").on(t.isPublished, t.publishedAt),
  ],
);

// ──────────────────────────────────────────────────────────────────────────────
// 4.7 Client Projects (the core table for the public client dashboard)
// ──────────────────────────────────────────────────────────────────────────────
export const clientProjects = pgTable(
  "client_projects",
  {
    id: id(),
    accessToken: varchar("access_token", { length: 64 }).notNull(),
    clientName: varchar("client_name", { length: 255 }).notNull(),
    clientEmail: varchar("client_email", { length: 255 }),
    projectTitle: varchar("project_title", { length: 500 }).notNull(),
    locale: varchar("locale", { length: 5 }).notNull().default("en"),
    status: varchar("status", { length: 30 }).notNull().default("not_started"),
    progressPct: integer("progress_pct").notNull().default(0),
    startDate: date("start_date"),
    estimatedEndDate: date("estimated_end_date"),
    totalPriceCents: integer("total_price_cents"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    notesForClient: text("notes_for_client"),
    internalNotes: text("internal_notes"),
    notifyOnUpdate: boolean("notify_on_update").notNull().default(true),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("client_projects_token_uniq").on(t.accessToken),
    index("client_projects_active_idx").on(t.isActive, t.updatedAt),
    check(
      "client_projects_status_check",
      sql`${t.status} IN ('not_started', 'in_progress', 'review', 'completed')`,
    ),
    check(
      "client_projects_progress_check",
      sql`${t.progressPct} >= 0 AND ${t.progressPct} <= 100`,
    ),
  ],
);

// ──────────────────────────────────────────────────────────────────────────────
// 4.8 Project Milestones
// ──────────────────────────────────────────────────────────────────────────────
export const projectMilestones = pgTable(
  "project_milestones",
  {
    id: id(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => clientProjects.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    dueDate: date("due_date"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [
    index("project_milestones_project_order_idx").on(
      t.projectId,
      t.displayOrder,
    ),
    check(
      "project_milestones_status_check",
      sql`${t.status} IN ('pending', 'in_progress', 'completed')`,
    ),
  ],
);

// ──────────────────────────────────────────────────────────────────────────────
// 4.9 Project Messages (admin ↔ client thread)
// ──────────────────────────────────────────────────────────────────────────────
export const projectMessages = pgTable(
  "project_messages",
  {
    id: id(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => clientProjects.id, { onDelete: "cascade" }),
    senderType: varchar("sender_type", { length: 10 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [
    index("project_messages_project_idx").on(t.projectId, t.createdAt),
    check(
      "project_messages_sender_check",
      sql`${t.senderType} IN ('admin', 'client')`,
    ),
  ],
);

// ──────────────────────────────────────────────────────────────────────────────
// 4.10 Project Deliverables (file uploads or external links)
// ──────────────────────────────────────────────────────────────────────────────
export const projectDeliverables = pgTable(
  "project_deliverables",
  {
    id: id(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => clientProjects.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 255 }).notNull(),
    fileUrl: text("file_url"),
    externalUrl: text("external_url"),
    deliveredAt: timestamp("delivered_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index("project_deliverables_project_idx").on(t.projectId, t.deliveredAt),
  ],
);

// ──────────────────────────────────────────────────────────────────────────────
// 4.11 Contact Submissions (lead inbox)
// ──────────────────────────────────────────────────────────────────────────────
export const contactSubmissions = pgTable(
  "contact_submissions",
  {
    id: id(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    projectType: varchar("project_type", { length: 100 }),
    message: text("message").notNull(),
    source: varchar("source", { length: 50 }).notNull().default("website"),
    isQualified: boolean("is_qualified").notNull().default(false),
    isArchived: boolean("is_archived").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [
    index("contact_submissions_inbox_idx").on(t.isArchived, t.createdAt),
    check(
      "contact_submissions_source_check",
      sql`${t.source} IN ('website', 'chatbot', 'referral')`,
    ),
  ],
);

// ──────────────────────────────────────────────────────────────────────────────
// 4.12 Chatbot Conversations (per-session message history)
// ──────────────────────────────────────────────────────────────────────────────
export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: string;
};

export const chatbotConversations = pgTable(
  "chatbot_conversations",
  {
    id: id(),
    sessionId: varchar("session_id", { length: 100 }).notNull(),
    messages: jsonb("messages")
      .notNull()
      .$type<ChatMessage[]>()
      .default(sql`'[]'::jsonb`),
    isQualified: boolean("is_qualified").notNull().default(false),
    contactSubmissionId: uuid("contact_submission_id").references(
      () => contactSubmissions.id,
      { onDelete: "set null" },
    ),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("chatbot_conversations_session_idx").on(t.sessionId),
    index("chatbot_conversations_qualified_idx").on(
      t.isQualified,
      t.createdAt,
    ),
  ],
);

// ──────────────────────────────────────────────────────────────────────────────
// Type exports for use in app code
// ──────────────────────────────────────────────────────────────────────────────
export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

export type PageContent = typeof pageContents.$inferSelect;
export type NewPageContent = typeof pageContents.$inferInsert;

export type PortfolioProject = typeof portfolioProjects.$inferSelect;
export type NewPortfolioProject = typeof portfolioProjects.$inferInsert;

export type PricingPlan = typeof pricingPlans.$inferSelect;
export type NewPricingPlan = typeof pricingPlans.$inferInsert;

export type PricingFeature = typeof pricingFeatures.$inferSelect;
export type NewPricingFeature = typeof pricingFeatures.$inferInsert;

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;

export type ClientProject = typeof clientProjects.$inferSelect;
export type NewClientProject = typeof clientProjects.$inferInsert;

export type ProjectMilestone = typeof projectMilestones.$inferSelect;
export type NewProjectMilestone = typeof projectMilestones.$inferInsert;

export type ProjectMessage = typeof projectMessages.$inferSelect;
export type NewProjectMessage = typeof projectMessages.$inferInsert;

export type ProjectDeliverable = typeof projectDeliverables.$inferSelect;
export type NewProjectDeliverable = typeof projectDeliverables.$inferInsert;

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type NewContactSubmission = typeof contactSubmissions.$inferInsert;

export type ChatbotConversation = typeof chatbotConversations.$inferSelect;
export type NewChatbotConversation = typeof chatbotConversations.$inferInsert;
