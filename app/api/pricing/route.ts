import { NextResponse, type NextRequest } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pricingPlans, pricingFeatures } from "@/drizzle/schema";
import { CreatePlanSchema } from "@/lib/validation/pricing";
import { apiError, handleApiError, requireAdmin } from "@/lib/api-helpers";
import { checkOrigin } from "@/lib/auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public: list active plans with their features (used by the public pricing page).
// Admin gets all plans (active + inactive) when ?include=all (admin cookie required).
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const includeAll = url.searchParams.get("include") === "all";

  const plans = includeAll
    ? await db.select().from(pricingPlans).orderBy(asc(pricingPlans.displayOrder))
    : await db
        .select()
        .from(pricingPlans)
        .where(eq(pricingPlans.isActive, true))
        .orderBy(asc(pricingPlans.displayOrder));

  // Verify the admin if asked for all plans (don't leak inactive plans publicly).
  if (includeAll) {
    try {
      await requireAdmin(req);
    } catch {
      return apiError("unauthorized", 401);
    }
  }

  // Hydrate features in one query.
  const features = await db
    .select()
    .from(pricingFeatures)
    .orderBy(asc(pricingFeatures.displayOrder));

  const grouped = plans.map((p) => ({
    ...p,
    features: features.filter((f) => f.planId === p.id),
  }));

  return NextResponse.json({ plans: grouped });
}

// Admin: create a plan. Single-locale text applied to all 4 locales for now.
export async function POST(req: NextRequest) {
  try {
    if (!checkOrigin(req)) return apiError("forbidden", 403);
    await requireAdmin(req);

    const body = await req.json().catch(() => null);
    const parsed = CreatePlanSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("invalid_payload", 400, { issues: parsed.error.flatten() });
    }
    const d = parsed.data;

    const i18nName = { en: d.name, fr: d.name, ht: d.name, es: d.name };
    const i18nDesc = { en: d.description, fr: d.description, ht: d.description, es: d.description };

    const [inserted] = await db
      .insert(pricingPlans)
      .values({
        slug: d.slug,
        name: i18nName,
        description: i18nDesc,
        priceUsd: d.priceUsd,
        priceHtg: d.priceHtg ?? null,
        priceEur: d.priceEur ?? null,
        priceCad: d.priceCad ?? null,
        billingType: d.billingType,
        isPopular: d.isPopular,
        displayOrder: d.displayOrder,
        isActive: d.isActive,
      })
      .returning();

    return NextResponse.json({ plan: inserted }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
