import Link from "next/link";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clientProjects } from "@/drizzle/schema";
import { COOKIE_NAMES, verifyAccessToken } from "@/lib/auth";
import { getAdminById } from "@/lib/auth-server";
import { extractPanelUidFromPath } from "@/lib/panel-uid";
import { SITE } from "@/lib/contact";
import AdminShell from "@/components/cms/AdminShell";
import NewClientForm from "@/components/cms/NewClientForm";
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

const STATUS_TONE: Record<string, string> = {
  not_started: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  in_progress: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  review: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

export default async function ClientsPage() {
  const uid = await readPanelUid();
  const admin = await requireAdmin();
  if (!admin) redirect(`/panel/${uid}/login`);

  const projects = await db
    .select()
    .from(clientProjects)
    .where(eq(clientProjects.isActive, true))
    .orderBy(desc(clientProjects.updatedAt));

  return (
    <AdminShell email={admin.email}>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-(family-name:--font-syne) text-3xl font-bold text-text-primary">
              Client projects
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Each project gets a private dashboard URL — share it via WhatsApp/email.
              No login required for clients.
            </p>
          </div>
          <NewClientForm />
        </header>

        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-bg-secondary px-6 py-16 text-center">
            <p className="text-sm text-text-secondary">
              No client projects yet. Click <span className="font-semibold text-text-primary">New project</span> above to create your first one.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-bg-secondary">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-bg-card">
                <tr className="text-left text-xs uppercase tracking-wider text-text-secondary">
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3 hidden md:table-cell">Client</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Progress</th>
                  <th className="px-4 py-3">Share link</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((p) => {
                  const tone = STATUS_TONE[p.status] ?? STATUS_TONE.not_started;
                  const shareUrl = `${SITE.url}/client/${p.accessToken}`;
                  return (
                    <tr key={p.id} className="hover:bg-bg-card/50 transition-colors">
                      <td className="px-4 py-3 align-top">
                        <Link
                          href={`/panel/${uid}/clients/${p.id}`}
                          className="font-medium text-text-primary hover:text-purple-400"
                        >
                          {p.projectTitle}
                        </Link>
                        <p className="md:hidden text-xs text-text-secondary mt-0.5">{p.clientName}</p>
                      </td>
                      <td className="px-4 py-3 align-top hidden md:table-cell text-text-secondary">
                        {p.clientName}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tone}`}>
                          {p.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-bg-primary">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                              style={{ width: `${p.progressPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-text-secondary w-8">{p.progressPct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <CopyButton value={shareUrl} label="Copy link" />
                      </td>
                      <td className="px-4 py-3 align-top hidden sm:table-cell text-xs text-text-secondary">
                        {new Date(p.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
