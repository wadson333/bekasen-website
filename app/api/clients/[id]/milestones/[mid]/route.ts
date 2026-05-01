import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clientProjects, projectMilestones } from "@/drizzle/schema";
import { UpdateMilestoneSchema } from "@/lib/validation/clients";
import { apiError, handleApiError, requireAdmin } from "@/lib/api-helpers";
import { checkOrigin } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; mid: string }> },
) {
  try {
    if (!checkOrigin(req)) return apiError("forbidden", 403);
    await requireAdmin(req);
    const { id, mid } = await ctx.params;

    const body = await req.json().catch(() => null);
    const parsed = UpdateMilestoneSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("invalid_payload", 400, { issues: parsed.error.flatten() });
    }

    const update: Partial<typeof projectMilestones.$inferInsert> = {};
    if (parsed.data.title !== undefined) update.title = parsed.data.title;
    if (parsed.data.description !== undefined)
      update.description = parsed.data.description ?? null;
    if (parsed.data.status !== undefined) {
      update.status = parsed.data.status;
      // When the admin marks the milestone completed, stamp completedAt
      if (parsed.data.status === "completed") {
        update.completedAt = new Date();
      } else {
        update.completedAt = null;
      }
    }
    if (parsed.data.dueDate !== undefined)
      update.dueDate = parsed.data.dueDate || null;
    if (parsed.data.displayOrder !== undefined)
      update.displayOrder = parsed.data.displayOrder;

    const [updated] = await db
      .update(projectMilestones)
      .set(update)
      .where(and(eq(projectMilestones.id, mid), eq(projectMilestones.projectId, id)))
      .returning();
    if (!updated) return apiError("not_found", 404);

    await db
      .update(clientProjects)
      .set({ updatedAt: new Date() })
      .where(eq(clientProjects.id, id));

    return NextResponse.json({ milestone: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; mid: string }> },
) {
  try {
    if (!checkOrigin(req)) return apiError("forbidden", 403);
    await requireAdmin(req);
    const { id, mid } = await ctx.params;

    const [removed] = await db
      .delete(projectMilestones)
      .where(and(eq(projectMilestones.id, mid), eq(projectMilestones.projectId, id)))
      .returning({ id: projectMilestones.id });
    if (!removed) return apiError("not_found", 404);

    await db
      .update(clientProjects)
      .set({ updatedAt: new Date() })
      .where(eq(clientProjects.id, id));

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
