import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { pricingFeatures } from "@/drizzle/schema";
import { CreateFeatureSchema } from "@/lib/validation/pricing";
import { apiError, handleApiError, requireAdmin } from "@/lib/api-helpers";
import { checkOrigin } from "@/lib/auth-server";

export const runtime = "nodejs";

// Admin: append a feature to a plan. Single-locale text applied to all 4 locales.
export async function POST(req: NextRequest) {
  try {
    if (!checkOrigin(req)) return apiError("forbidden", 403);
    await requireAdmin(req);

    const body = await req.json().catch(() => null);
    const parsed = CreateFeatureSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("invalid_payload", 400, { issues: parsed.error.flatten() });
    }
    const d = parsed.data;

    const i18nLabel = { en: d.label, fr: d.label, ht: d.label, es: d.label };
    const i18nTooltip = d.tooltip
      ? { en: d.tooltip, fr: d.tooltip, ht: d.tooltip, es: d.tooltip }
      : null;

    const [inserted] = await db
      .insert(pricingFeatures)
      .values({
        planId: d.planId,
        label: i18nLabel,
        isIncluded: d.isIncluded,
        tooltip: i18nTooltip,
        displayOrder: d.displayOrder,
      })
      .returning();

    return NextResponse.json({ feature: inserted }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
