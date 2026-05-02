import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/drizzle/schema";
import { apiError, handleApiError, requireAdmin } from "@/lib/api-helpers";
import { checkOrigin } from "@/lib/auth-server";

export const runtime = "nodejs";

const PatchSchema = z.object({
  isArchived: z.boolean().optional(),
  isQualified: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    if (!checkOrigin(req)) return apiError("forbidden", 403);
    await requireAdmin(req);

    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) return apiError("invalid_payload", 400);

    const update: Partial<typeof contactSubmissions.$inferInsert> = {};
    if (parsed.data.isArchived !== undefined) update.isArchived = parsed.data.isArchived;
    if (parsed.data.isQualified !== undefined) update.isQualified = parsed.data.isQualified;
    if (Object.keys(update).length === 0) return apiError("nothing_to_update", 400);

    const [updated] = await db
      .update(contactSubmissions)
      .set(update)
      .where(eq(contactSubmissions.id, id))
      .returning();
    if (!updated) return apiError("not_found", 404);

    return NextResponse.json({ lead: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    if (!checkOrigin(req)) return apiError("forbidden", 403);
    await requireAdmin(req);

    const { id } = await ctx.params;
    const [removed] = await db
      .delete(contactSubmissions)
      .where(eq(contactSubmissions.id, id))
      .returning({ id: contactSubmissions.id });
    if (!removed) return apiError("not_found", 404);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
