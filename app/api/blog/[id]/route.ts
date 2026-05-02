import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogPosts } from "@/drizzle/schema";
import { UpdateBlogPostSchema } from "@/lib/validation/blog";
import { apiError, handleApiError, requireAdmin } from "@/lib/api-helpers";
import { checkOrigin } from "@/lib/auth-server";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    if (!checkOrigin(req)) return apiError("forbidden", 403);
    await requireAdmin(req);
    const { id } = await ctx.params;

    const body = await req.json().catch(() => null);
    const parsed = UpdateBlogPostSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("invalid_payload", 400, { issues: parsed.error.flatten() });
    }
    const p = parsed.data;

    // Read current row to detect publish transition.
    const [current] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .limit(1);
    if (!current) return apiError("not_found", 404);

    const update: Partial<typeof blogPosts.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (p.slug !== undefined) update.slug = p.slug;
    if (p.locale !== undefined) update.locale = p.locale;
    if (p.title !== undefined) update.title = p.title;
    if (p.excerpt !== undefined) update.excerpt = p.excerpt || null;
    if (p.body !== undefined) update.body = p.body;
    if (p.coverImageUrl !== undefined) update.coverImageUrl = p.coverImageUrl || null;
    if (p.tags !== undefined) update.tags = p.tags;
    if (p.isPublished !== undefined) {
      update.isPublished = p.isPublished;
      // Stamp publishedAt the first time the post goes from draft → published.
      if (p.isPublished && !current.publishedAt) {
        update.publishedAt = new Date();
      }
    }

    const [updated] = await db
      .update(blogPosts)
      .set(update)
      .where(eq(blogPosts.id, id))
      .returning();
    if (!updated) return apiError("not_found", 404);

    return NextResponse.json({ post: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

// Hard delete — drafts and published posts both removed permanently.
// (Soft-delete via isPublished=false is also available through PUT.)
export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    if (!checkOrigin(req)) return apiError("forbidden", 403);
    await requireAdmin(req);
    const { id } = await ctx.params;

    const [removed] = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning({ id: blogPosts.id });
    if (!removed) return apiError("not_found", 404);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
