import { z } from "zod";

export const PortfolioCategoryEnum = z.enum(["showcase", "business", "webapp", "saas"]);

export const CreatePortfolioSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(255)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "lowercase_alpha_dash_only"),
  // Single-locale text — applied to all 4 locales for now. Per-locale editing
  // ships when a richer CMS form lands (Tiptap content editor phase).
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(2000),
  category: PortfolioCategoryEnum,
  thumbnailUrl: z.string().url().max(2000),
  demoUrl: z.string().url().max(2000).optional().or(z.literal("")),
  techStack: z.array(z.string().trim().min(1).max(50)).min(1).max(20),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export const UpdatePortfolioSchema = CreatePortfolioSchema.partial();
