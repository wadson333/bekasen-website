import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pricingFeatures, type LocalizedString } from "@/drizzle/schema";
import { UpdateFeatureSchema } from "@/lib/validation/pricing";
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
    const parsed = UpdateFeatureSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("invalid_payload", 400, { issues: parsed.error.flatten() });
    }
    const f = parsed.data;

    const update: Partial<typeof pricingFeatures.$inferInsert> = {};
    if (f.label !== undefined) {
      const v: LocalizedString = { en: f.label, fr: f.label, ht: f.label, es: f.label };
      update.label = v;
    }
    if (f.isIncluded !== undefined) update.isIncluded = f.isIncluded;
    if (f.tooltip !== undefined) {
      if (f.tooltip === "") {
        update.tooltip = null;
      } else {
        const v: LocalizedString = {
          en: f.tooltip,
          fr: f.tooltip,
          ht: f.tooltip,
          es: f.tooltip,
        };
        update.tooltip = v;
      }
    }
    if (f.displayOrder !== undefined) update.displayOrder = f.displayOrder;

    const [updated] = await db
      .update(pricingFeatures)
      .set(update)
      .where(eq(pricingFeatures.id, id))
      .returning();
    if (!updated) return apiError("not_found", 404);

    return NextResponse.json({ feature: updated });
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
      .delete(pricingFeatures)
      .where(eq(pricingFeatures.id, id))
      .returning({ id: pricingFeatures.id });
    if (!removed) return apiError("not_found", 404);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
