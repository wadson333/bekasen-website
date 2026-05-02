import { z } from "zod";

export const ContentLocaleEnum = z.enum(["fr", "en", "ht", "es"]);

const pageKey = z
  .string()
  .trim()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?$/, "lowercase_alpha_dash_underscore_only");

// v1 stores body as a single markdown block: { blocks: [{ type: "markdown", content: ... }] }
// When the Tiptap editor lands later, it will append/replace richer block shapes
// without breaking this row format.
export const CreatePageContentSchema = z.object({
  pageKey,
  locale: ContentLocaleEnum,
  title: z.string().trim().max(500).optional().or(z.literal("")),
  bodyMarkdown: z.string().trim().min(1).max(200_000),
  metaTitle: z.string().trim().max(255).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(1000).optional().or(z.literal("")),
  isPublished: z.boolean().default(true),
});

export const UpdatePageContentSchema = CreatePageContentSchema.partial();

export type PageContentBody = {
  blocks: Array<{ type: string; content?: unknown; [k: string]: unknown }>;
};

export function wrapMarkdown(markdown: string): PageContentBody {
  return { blocks: [{ type: "markdown", content: markdown }] };
}

export function unwrapMarkdown(body: PageContentBody | null | undefined): string {
  if (!body || !Array.isArray(body.blocks)) return "";
  const first = body.blocks.find((b) => b.type === "markdown");
  if (!first) return "";
  const c = first.content;
  return typeof c === "string" ? c : "";
}
