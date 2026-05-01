import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clientProjects, projectDeliverables } from "@/drizzle/schema";
import { CreateDeliverableSchema } from "@/lib/validation/clients";
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
    const parsed = CreateDeliverableSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("invalid_payload", 400, { issues: parsed.error.flatten() });
    }

    const [project] = await db
      .select({ id: clientProjects.id })
      .from(clientProjects)
      .where(eq(clientProjects.id, id))
      .limit(1);
    if (!project) return apiError("not_found", 404);

    const [deliverable] = await db
      .insert(projectDeliverables)
      .values({
        projectId: id,
        label: parsed.data.label,
        fileUrl: parsed.data.fileUrl ?? null,
        externalUrl: parsed.data.externalUrl ?? null,
      })
      .returning();

    await db
      .update(clientProjects)
      .set({ updatedAt: new Date() })
      .where(eq(clientProjects.id, id));

    return NextResponse.json({ deliverable }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
