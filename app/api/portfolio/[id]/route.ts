import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolioProjects, type LocalizedString } from "@/drizzle/schema";
import { UpdatePortfolioSchema } from "@/lib/validation/portfolio";
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
    const parsed = UpdatePortfolioSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("invalid_payload", 400, { issues: parsed.error.flatten() });
    }
    const p = parsed.data;

    const update: Partial<typeof portfolioProjects.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (p.slug !== undefined) update.slug = p.slug;
    if (p.title !== undefined) {
      const t: LocalizedString = { en: p.title, fr: p.title, ht: p.title, es: p.title };
      update.title = t;
    }
    if (p.description !== undefined) {
      const d: LocalizedString = {
        en: p.description,
        fr: p.description,
        ht: p.description,
        es: p.description,
      };
      update.description = d;
    }
    if (p.category !== undefined) update.category = p.category;
    if (p.thumbnailUrl !== undefined) update.thumbnailUrl = p.thumbnailUrl;
    if (p.demoUrl !== undefined) update.demoUrl = p.demoUrl || null;
    if (p.techStack !== undefined) update.techStack = p.techStack;
    if (p.isFeatured !== undefined) update.isFeatured = p.isFeatured;
    if (p.displayOrder !== undefined) update.displayOrder = p.displayOrder;
    if (p.isPublished !== undefined) update.isPublished = p.isPublished;

    const [updated] = await db
      .update(portfolioProjects)
      .set(update)
      .where(eq(portfolioProjects.id, id))
      .returning();
    if (!updated) return apiError("not_found", 404);

    return NextResponse.json({ project: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    if (!checkOrigin(req)) return apiError("forbidden", 403);
    await requireAdmin(req);
    const { id } = await ctx.params;

    // Soft delete via is_published=false (kept as the homepage may reference
    // them historically). Hard delete possible via Adminer if needed.
    const [archived] = await db
      .update(portfolioProjects)
      .set({ isPublished: false, updatedAt: new Date() })
      .where(eq(portfolioProjects.id, id))
      .returning({ id: portfolioProjects.id });
    if (!archived) return apiError("not_found", 404);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
