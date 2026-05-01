import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clientProjects, projectMessages } from "@/drizzle/schema";
import { CreateMessageSchema } from "@/lib/validation/clients";
import { sanitizePlainText } from "@/lib/sanitize";
import { apiError, handleApiError, requireAdmin } from "@/lib/api-helpers";
import { checkOrigin } from "@/lib/auth-server";

export const runtime = "nodejs";

/**
 * POST /api/clients/[id]/messages
 * Admin posts a message in a project thread.
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    if (!checkOrigin(req)) return apiError("forbidden", 403);
    await requireAdmin(req);
    const { id } = await ctx.params;

    const body = await req.json().catch(() => null);
    const parsed = CreateMessageSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("invalid_payload", 400, { issues: parsed.error.flatten() });
    }

    const [project] = await db
      .select({ id: clientProjects.id })
      .from(clientProjects)
      .where(eq(clientProjects.id, id))
      .limit(1);
    if (!project) return apiError("not_found", 404);

    const cleaned = sanitizePlainText(parsed.data.message);
    if (!cleaned) return apiError("empty_message", 400);

    const [message] = await db
      .insert(projectMessages)
      .values({
        projectId: id,
        senderType: "admin",
        message: cleaned,
        isRead: false,
      })
      .returning();

    await db
      .update(clientProjects)
      .set({ updatedAt: new Date() })
      .where(eq(clientProjects.id, id));

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
