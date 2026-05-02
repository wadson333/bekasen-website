import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pageContents } from "@/drizzle/schema";
import { UpdatePageContentSchema, wrapMarkdown } from "@/lib/validation/content";
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
    const parsed = UpdatePageContentSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("invalid_payload", 400, { issues: parsed.error.flatten() });
    }
    const p = parsed.data;

    const update: Partial<typeof pageContents.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (p.pageKey !== undefined) update.pageKey = p.pageKey;
    if (p.locale !== undefined) update.locale = p.locale;
    if (p.title !== undefined) update.title = p.title || null;
    if (p.bodyMarkdown !== undefined) update.body = wrapMarkdown(p.bodyMarkdown);
    if (p.metaTitle !== undefined) update.metaTitle = p.metaTitle || null;
    if (p.metaDescription !== undefined) update.metaDescription = p.metaDescription || null;
    if (p.isPublished !== undefined) update.isPublished = p.isPublished;

    const [updated] = await db
      .update(pageContents)
      .set(update)
      .where(eq(pageContents.id, id))
      .returning();
    if (!updated) return apiError("not_found", 404);

    return NextResponse.json({ content: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    if (!checkOrigin(req)) return apiError("forbidden", 403);
    await requireAdmin(req);
    const { id } = await ctx.params;

    const [removed] = await db
      .delete(pageContents)
      .where(eq(pageContents.id, id))
      .returning({ id: pageContents.id });
    if (!removed) return apiError("not_found", 404);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
