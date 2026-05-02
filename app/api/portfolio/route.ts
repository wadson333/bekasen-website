import { NextResponse, type NextRequest } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolioProjects } from "@/drizzle/schema";
import { CreatePortfolioSchema } from "@/lib/validation/portfolio";
import { apiError, handleApiError, requireAdmin } from "@/lib/api-helpers";
import { checkOrigin } from "@/lib/auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public: list published portfolio projects (used by the public site).
export async function GET() {
  const rows = await db
    .select()
    .from(portfolioProjects)
    .where(eq(portfolioProjects.isPublished, true))
    .orderBy(asc(portfolioProjects.displayOrder));
  return NextResponse.json({ projects: rows });
}

// Admin: create a new portfolio entry. The single text inputs are applied to
// all 4 locales (fr/en/ht/es) — admin can edit per-locale via DB or a future
// Tiptap content editor.
export async function POST(req: NextRequest) {
  try {
    if (!checkOrigin(req)) return apiError("forbidden", 403);
    await requireAdmin(req);

    const body = await req.json().catch(() => null);
    const parsed = CreatePortfolioSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("invalid_payload", 400, { issues: parsed.error.flatten() });
    }
    const d = parsed.data;

    const i18nTitle = { en: d.title, fr: d.title, ht: d.title, es: d.title };
    const i18nDesc = { en: d.description, fr: d.description, ht: d.description, es: d.description };

    const [inserted] = await db
      .insert(portfolioProjects)
      .values({
        slug: d.slug,
        title: i18nTitle,
        description: i18nDesc,
        category: d.category,
        thumbnailUrl: d.thumbnailUrl,
        demoUrl: d.demoUrl || null,
        techStack: d.techStack,
        isFeatured: d.isFeatured,
        displayOrder: d.displayOrder,
        isPublished: d.isPublished,
      })
      .returning();

    return NextResponse.json({ project: inserted }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
