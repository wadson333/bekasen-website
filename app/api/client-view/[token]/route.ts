import { NextResponse, type NextRequest } from "next/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  clientProjects,
  projectMilestones,
  projectMessages,
  projectDeliverables,
} from "@/drizzle/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/client-view/[token]
 *
 * Public endpoint — no auth, but token must be a valid 64-hex string AND
 * exist in the DB on an active project. We never leak whether the token
 * format was wrong vs the project not found vs archived (always 404).
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;

  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const [project] = await db
    .select()
    .from(clientProjects)
    .where(and(eq(clientProjects.accessToken, token), eq(clientProjects.isActive, true)))
    .limit(1);

  if (!project) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const [milestones, messages, deliverables] = await Promise.all([
    db
      .select()
      .from(projectMilestones)
      .where(eq(projectMilestones.projectId, project.id))
      .orderBy(asc(projectMilestones.displayOrder)),
    db
      .select()
      .from(projectMessages)
      .where(eq(projectMessages.projectId, project.id))
      .orderBy(asc(projectMessages.createdAt)),
    db
      .select()
      .from(projectDeliverables)
      .where(eq(projectDeliverables.projectId, project.id))
      .orderBy(desc(projectDeliverables.deliveredAt)),
  ]);

  // Strip founder-only fields before returning to the client
  const publicProject = {
    id: project.id,
    clientName: project.clientName,
    projectTitle: project.projectTitle,
    locale: project.locale,
    status: project.status,
    progressPct: project.progressPct,
    startDate: project.startDate,
    estimatedEndDate: project.estimatedEndDate,
    notesForClient: project.notesForClient,
    updatedAt: project.updatedAt,
  };

  return NextResponse.json({
    project: publicProject,
    milestones,
    messages,
    deliverables,
  });
}
