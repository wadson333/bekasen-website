import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { asc, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolioProjects } from "@/drizzle/schema";
import { COOKIE_NAMES, verifyAccessToken } from "@/lib/auth";
import { getAdminById } from "@/lib/auth-server";
import { extractPanelUidFromPath } from "@/lib/panel-uid";
import AdminShell from "@/components/cms/AdminShell";
import PortfolioForm from "@/components/cms/PortfolioForm";
import PortfolioRow from "@/components/cms/PortfolioRow";

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

export default async function PortfolioCmsPage() {
  const uid = await readPanelUid();
  const admin = await requireAdmin();
  if (!admin) redirect(`/panel/${uid}/login`);

  const projects = await db
    .select()
    .from(portfolioProjects)
    .orderBy(asc(portfolioProjects.displayOrder), desc(portfolioProjects.createdAt));

  return (
    <AdminShell email={admin.email}>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-(family-name:--font-syne) text-3xl font-bold text-text-primary">
              Portfolio
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Demo projects shown on the homepage. Toggle published / featured here.
            </p>
          </div>
          <PortfolioForm mode="create" />
        </header>

        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-bg-secondary px-6 py-16 text-center">
            <p className="text-sm text-text-secondary">
              No portfolio projects yet. Click <span className="font-semibold text-text-primary">New project</span> to add one.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-bg-secondary">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-bg-card">
                <tr className="text-left text-xs uppercase tracking-wider text-text-secondary">
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 hidden md:table-cell">Tech</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Demo URL</th>
                  <th className="px-4 py-3 w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((p) => (
                  <PortfolioRow key={p.id} project={p} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
