import Link from "next/link";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  clientProjects,
  projectDeliverables,
  projectMessages,
  projectMilestones,
} from "@/drizzle/schema";
import { COOKIE_NAMES, verifyAccessToken } from "@/lib/auth";
import { getAdminById } from "@/lib/auth-server";
import { extractPanelUidFromPath } from "@/lib/panel-uid";
import { SITE } from "@/lib/contact";
import AdminShell from "@/components/cms/AdminShell";
import ClientProjectEditor from "@/components/cms/ClientProjectEditor";
import MilestoneManager from "@/components/cms/MilestoneManager";
import AdminMessageComposer from "@/components/cms/AdminMessageComposer";
import DeliverableManager from "@/components/cms/DeliverableManager";
import CopyButton from "@/components/cms/CopyButton";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAMES.access)?.value;
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  if (!payload?.sub) return null;
  return getAdminById(payload.sub);
}

async function readPanelUid(): Promise<string> {
  const fromEnv = process.env.ADMIN_PANEL_UID?.trim();
  if (fromEnv) return fromEnv;
  const h = await headers();
  return extractPanelUidFromPath(h.get("x-invoke-path") ?? "") ?? "";
}

type ClientDetailParams = { id: string };

export default async function ClientDetailPage(
  props: PageProps<"/panel/[uid]/clients/[id]">,
) {
  const uid = await readPanelUid();
  const admin = await requireAdmin();
  if (!admin) redirect(`/panel/${uid}/login`);

  const { id } = (await props.params) as ClientDetailParams;

  const [project] = await db
    .select()
    .from(clientProjects)
    .where(and(eq(clientProjects.id, id), eq(clientProjects.isActive, true)))
    .limit(1);

  if (!project) notFound();

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

  const shareUrl = `${SITE.url}/client/${project.accessToken}`;

  return (
    <AdminShell email={admin.email}>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href={`/panel/${uid}/clients`}
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to all clients
        </Link>

        <header className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-(family-name:--font-syne) text-3xl font-bold text-text-primary">
              {project.projectTitle}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Client: <span className="text-text-primary">{project.clientName}</span>
              {project.clientEmail ? (
                <>
                  {" · "}
                  <a href={`mailto:${project.clientEmail}`} className="hover:text-purple-400">
                    {project.clientEmail}
                  </a>
                </>
              ) : null}
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-2 lg:items-end">
            <div className="flex items-center gap-2">
              <CopyButton value={shareUrl} label="Copy public link" />
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-card px-2 py-1 text-xs text-text-secondary hover:border-purple-500/40 hover:text-text-primary transition-colors"
              >
                <ExternalLink className="h-3 w-3" /> Open as client
              </a>
            </div>
            <p className="text-[11px] text-text-secondary lg:text-right">
              Token last updated {new Date(project.updatedAt).toLocaleString()}
            </p>
          </div>
        </header>

        <div className="mt-8 space-y-6">
          <ClientProjectEditor project={project} />
          <MilestoneManager projectId={project.id} milestones={milestones} />
          <AdminMessageComposer projectId={project.id} messages={messages} />
          <DeliverableManager projectId={project.id} deliverables={deliverables} />
        </div>
      </div>
    </AdminShell>
  );
}
