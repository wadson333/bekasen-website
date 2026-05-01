import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { clientProjects, projectMilestones } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { CreateMilestoneSchema } from "@/lib/validation/clients";
import { apiError, handleApiError, requireAdmin } from "@/lib/api-helpers";
import { checkOrigin } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    if (!checkOrigin(req)) return apiError("forbidden", 403);
    await requireAdmin(req);
    const { id } = await ctx.params;

    const body = await req.json().catch(() => null);
    const parsed = CreateMilestoneSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("invalid_payload", 400, { issues: parsed.error.flatten() });
    }

    // Verify project exists
    const [project] = await db
      .select({ id: clientProjects.id })
      .from(clientProjects)
      .where(eq(clientProjects.id, id))
      .limit(1);
    if (!project) return apiError("not_found", 404);

    const [milestone] = await db
      .insert(projectMilestones)
      .values({
        projectId: id,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        status: parsed.data.status,
        dueDate: parsed.data.dueDate || null,
        displayOrder: parsed.data.displayOrder,
      })
      .returning();

    // Bump parent project updatedAt
    await db
      .update(clientProjects)
      .set({ updatedAt: new Date() })
      .where(eq(clientProjects.id, id));

    return NextResponse.json({ milestone }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
