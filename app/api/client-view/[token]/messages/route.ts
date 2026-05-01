import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clientProjects, projectMessages } from "@/drizzle/schema";
import { CreateMessageSchema } from "@/lib/validation/clients";
import { sanitizePlainText } from "@/lib/sanitize";

export const runtime = "nodejs";

/**
 * POST /api/client-view/[token]/messages
 *
 * Public endpoint — the client posts a reply. Token must be valid + project
 * active. Message is sanitized (HTML stripped, max 2000 chars). No auth, no
 * email; the access token IS the credential.
 *
 * Rate limited at the Nginx layer (30 req/min/IP).
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;

  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = CreateMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const cleaned = sanitizePlainText(parsed.data.message);
  if (!cleaned) {
    return NextResponse.json({ error: "empty_message" }, { status: 400 });
  }

  const [project] = await db
    .select({ id: clientProjects.id })
    .from(clientProjects)
    .where(and(eq(clientProjects.accessToken, token), eq(clientProjects.isActive, true)))
    .limit(1);
  if (!project) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const [message] = await db
    .insert(projectMessages)
    .values({
      projectId: project.id,
      senderType: "client",
      message: cleaned,
      isRead: false,
    })
    .returning();

  await db
    .update(clientProjects)
    .set({ updatedAt: new Date() })
    .where(eq(clientProjects.id, project.id));

  return NextResponse.json({ message }, { status: 201 });
}
