import { z } from "zod";

export const BlogLocaleEnum = z.enum(["fr", "en", "ht", "es"]);

const slug = z
  .string()
  .trim()
  .min(2)
  .max(255)
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "lowercase_alpha_dash_only");

export const CreateBlogPostSchema = z.object({
  slug,
  locale: BlogLocaleEnum,
  title: z.string().trim().min(1).max(500),
  excerpt: z.string().trim().max(2000).optional().or(z.literal("")),
  // Markdown body — sanitized at render time on the public site.
  body: z.string().trim().min(1).max(200_000),
  coverImageUrl: z.string().url().max(2000).optional().or(z.literal("")),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  isPublished: z.boolean().default(false),
});

export const UpdateBlogPostSchema = CreateBlogPostSchema.partial();
