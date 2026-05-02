import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pricingPlans, type LocalizedString } from "@/drizzle/schema";
import { UpdatePlanSchema } from "@/lib/validation/pricing";
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
    const parsed = UpdatePlanSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("invalid_payload", 400, { issues: parsed.error.flatten() });
    }
    const p = parsed.data;

    const update: Partial<typeof pricingPlans.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (p.slug !== undefined) update.slug = p.slug;
    if (p.name !== undefined) {
      const v: LocalizedString = { en: p.name, fr: p.name, ht: p.name, es: p.name };
      update.name = v;
    }
    if (p.description !== undefined) {
      const v: LocalizedString = {
        en: p.description,
        fr: p.description,
        ht: p.description,
        es: p.description,
      };
      update.description = v;
    }
    if (p.priceUsd !== undefined) update.priceUsd = p.priceUsd;
    if (p.priceHtg !== undefined) update.priceHtg = p.priceHtg;
    if (p.priceEur !== undefined) update.priceEur = p.priceEur;
    if (p.priceCad !== undefined) update.priceCad = p.priceCad;
    if (p.billingType !== undefined) update.billingType = p.billingType;
    if (p.isPopular !== undefined) update.isPopular = p.isPopular;
    if (p.displayOrder !== undefined) update.displayOrder = p.displayOrder;
    if (p.isActive !== undefined) update.isActive = p.isActive;

    const [updated] = await db
      .update(pricingPlans)
      .set(update)
      .where(eq(pricingPlans.id, id))
      .returning();
    if (!updated) return apiError("not_found", 404);

    return NextResponse.json({ plan: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

// Soft delete: deactivate the plan. Features cascade only on hard delete; here
// we keep them in place so reactivating restores everything.
export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    if (!checkOrigin(req)) return apiError("forbidden", 403);
    await requireAdmin(req);
    const { id } = await ctx.params;

    const [archived] = await db
      .update(pricingPlans)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(pricingPlans.id, id))
      .returning({ id: pricingPlans.id });
    if (!archived) return apiError("not_found", 404);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
