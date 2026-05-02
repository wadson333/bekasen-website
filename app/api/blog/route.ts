import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogPosts } from "@/drizzle/schema";
import { CreateBlogPostSchema } from "@/lib/validation/blog";
import { apiError, handleApiError, requireAdmin } from "@/lib/api-helpers";
import { checkOrigin } from "@/lib/auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET — public lists published posts for the requested locale (?locale=fr).
// Admin gets every row (drafts + all locales) when ?include=all (auth required).
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const includeAll = url.searchParams.get("include") === "all";
  const localeParam = url.searchParams.get("locale");

  if (includeAll) {
    try {
      await requireAdmin(req);
    } catch {
      return apiError("unauthorized", 401);
    }
    const rows = await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.updatedAt));
    return NextResponse.json({ posts: rows });
  }

  const conditions = [eq(blogPosts.isPublished, true)];
  if (localeParam) conditions.push(eq(blogPosts.locale, localeParam));

  const rows = await db
    .select()
    .from(blogPosts)
    .where(and(...conditions))
    .orderBy(desc(blogPosts.publishedAt));
  return NextResponse.json({ posts: rows });
}

// Admin: create a blog post (one row per locale).
export async function POST(req: NextRequest) {
  try {
    if (!checkOrigin(req)) return apiError("forbidden", 403);
    await requireAdmin(req);

    const body = await req.json().catch(() => null);
    const parsed = CreateBlogPostSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("invalid_payload", 400, { issues: parsed.error.flatten() });
    }
    const d = parsed.data;

    // Detect duplicate (slug+locale composite unique).
    const existing = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, d.slug), eq(blogPosts.locale, d.locale)))
      .limit(1);
    if (existing.length > 0) {
      return apiError("duplicate_slug_locale", 409);
    }

    const [inserted] = await db
      .insert(blogPosts)
      .values({
        slug: d.slug,
        locale: d.locale,
        title: d.title,
        excerpt: d.excerpt || null,
        body: d.body,
        coverImageUrl: d.coverImageUrl || null,
        tags: d.tags,
        isPublished: d.isPublished,
        publishedAt: d.isPublished ? new Date() : null,
      })
      .returning();

    return NextResponse.json({ post: inserted }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
