import { NextResponse, type NextRequest } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pageContents } from "@/drizzle/schema";
import { CreatePageContentSchema, wrapMarkdown } from "@/lib/validation/content";
import { apiError, handleApiError, requireAdmin } from "@/lib/api-helpers";
import { checkOrigin } from "@/lib/auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET — admin gets every row when ?include=all; public callers can fetch a
// single (pageKey, locale) pair. Public always filters to isPublished=true.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const includeAll = url.searchParams.get("include") === "all";

  if (includeAll) {
    try {
      await requireAdmin(req);
    } catch {
      return apiError("unauthorized", 401);
    }
    const rows = await db
      .select()
      .from(pageContents)
      .orderBy(asc(pageContents.pageKey), asc(pageContents.locale));
    return NextResponse.json({ contents: rows });
  }

  const pageKey = url.searchParams.get("pageKey");
  const locale = url.searchParams.get("locale");
  if (!pageKey || !locale) {
    return apiError("missing_pageKey_or_locale", 400);
  }

  const [row] = await db
    .select()
    .from(pageContents)
    .where(
      and(
        eq(pageContents.pageKey, pageKey),
        eq(pageContents.locale, locale),
        eq(pageContents.isPublished, true),
      ),
    )
    .limit(1);

  if (!row) return apiError("not_found", 404);
  return NextResponse.json({ content: row });
}

export async function POST(req: NextRequest) {
  try {
    if (!checkOrigin(req)) return apiError("forbidden", 403);
    await requireAdmin(req);

    const body = await req.json().catch(() => null);
    const parsed = CreatePageContentSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("invalid_payload", 400, { issues: parsed.error.flatten() });
    }
    const d = parsed.data;

    const existing = await db
      .select({ id: pageContents.id })
      .from(pageContents)
      .where(and(eq(pageContents.pageKey, d.pageKey), eq(pageContents.locale, d.locale)))
      .limit(1);
    if (existing.length > 0) {
      return apiError("duplicate_pagekey_locale", 409);
    }

    const [inserted] = await db
      .insert(pageContents)
      .values({
        pageKey: d.pageKey,
        locale: d.locale,
        title: d.title || null,
        body: wrapMarkdown(d.bodyMarkdown),
        metaTitle: d.metaTitle || null,
        metaDescription: d.metaDescription || null,
        isPublished: d.isPublished,
      })
      .returning();

    return NextResponse.json({ content: inserted }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
