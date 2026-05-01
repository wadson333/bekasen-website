import { NextResponse, type NextRequest } from "next/server";
import { eq, asc, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  clientProjects,
  projectMilestones,
  projectMessages,
  projectDeliverables,
} from "@/drizzle/schema";
import { UpdateClientProjectSchema } from "@/lib/validation/clients";
import { apiError, handleApiError, requireAdmin } from "@/lib/api-helpers";
import { checkOrigin } from "@/lib/auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin(req);
    const { id } = await ctx.params;

    const [project] = await db
      .select()
      .from(clientProjects)
      .where(eq(clientProjects.id, id))
      .limit(1);
    if (!project) return apiError("not_found", 404);

    const [milestones, messages, deliverables] = await Promise.all([
      db
        .select()
        .from(projectMilestones)
        .where(eq(projectMilestones.projectId, id))
        .orderBy(asc(projectMilestones.displayOrder)),
      db
        .select()
        .from(projectMessages)
        .where(eq(projectMessages.projectId, id))
        .orderBy(asc(projectMessages.createdAt)),
      db
        .select()
        .from(projectDeliverables)
        .where(eq(projectDeliverables.projectId, id))
        .orderBy(desc(projectDeliverables.deliveredAt)),
    ]);

    return NextResponse.json({ project, milestones, messages, deliverables });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    if (!checkOrigin(req)) return apiError("forbidden", 403);
    await requireAdmin(req);
    const { id } = await ctx.params;

    const body = await req.json().catch(() => null);
    const parsed = UpdateClientProjectSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("invalid_payload", 400, { issues: parsed.error.flatten() });
    }
    const patch = parsed.data;

    const update: Partial<typeof clientProjects.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (patch.clientName !== undefined) update.clientName = patch.clientName;
    if (patch.clientEmail !== undefined)
      update.clientEmail = patch.clientEmail || null;
    if (patch.projectTitle !== undefined) update.projectTitle = patch.projectTitle;
    if (patch.locale !== undefined) update.locale = patch.locale;
    if (patch.status !== undefined) update.status = patch.status;
    if (patch.progressPct !== undefined) update.progressPct = patch.progressPct;
    if (patch.startDate !== undefined)
      update.startDate = patch.startDate || null;
    if (patch.estimatedEndDate !== undefined)
      update.estimatedEndDate = patch.estimatedEndDate || null;
    if (patch.totalPriceCents !== undefined)
      update.totalPriceCents = patch.totalPriceCents ?? null;
    if (patch.currency !== undefined) update.currency = patch.currency;
    if (patch.notesForClient !== undefined)
      update.notesForClient = patch.notesForClient ?? null;
    if (patch.internalNotes !== undefined)
      update.internalNotes = patch.internalNotes ?? null;
    if (patch.notifyOnUpdate !== undefined)
      update.notifyOnUpdate = patch.notifyOnUpdate;

    const [updated] = await db
      .update(clientProjects)
      .set(update)
      .where(eq(clientProjects.id, id))
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

    // Soft delete via is_active flag
    const [archived] = await db
      .update(clientProjects)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(clientProjects.id, id))
      .returning({ id: clientProjects.id });

    if (!archived) return apiError("not_found", 404);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
