import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { pageContents } from "@/drizzle/schema";
import { COOKIE_NAMES, verifyAccessToken } from "@/lib/auth";
import { getAdminById } from "@/lib/auth-server";
import { extractPanelUidFromPath } from "@/lib/panel-uid";
import AdminShell from "@/components/cms/AdminShell";
import PageContentForm from "@/components/cms/PageContentForm";
import PageContentRow from "@/components/cms/PageContentRow";

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

export default async function ContentCmsPage() {
  const uid = await readPanelUid();
  const admin = await requireAdmin();
  if (!admin) redirect(`/panel/${uid}/login`);

  const rows = await db
    .select()
    .from(pageContents)
    .orderBy(asc(pageContents.pageKey), asc(pageContents.locale));

  return (
    <AdminShell email={admin.email}>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-(family-name:--font-syne) text-3xl font-bold text-text-primary">
              Page contents
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Long-form copy that overrides <code className="rounded bg-bg-card px-1 py-0.5 text-[11px]">messages/*.json</code>.
              One row per (page key, locale). Body is markdown; the rich block editor lands later.
            </p>
          </div>
          <PageContentForm mode="create" />
        </header>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-bg-secondary px-6 py-16 text-center">
            <p className="text-sm text-text-secondary">
              No page-content overrides yet. Click <span className="font-semibold text-text-primary">New entry</span> to add one
              (e.g. <code className="rounded bg-bg-card px-1 py-0.5 text-[11px]">hero</code>,{" "}
              <code className="rounded bg-bg-card px-1 py-0.5 text-[11px]">about</code>,{" "}
              <code className="rounded bg-bg-card px-1 py-0.5 text-[11px]">services</code>).
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-bg-secondary">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-bg-card">
                <tr className="text-left text-xs uppercase tracking-wider text-text-secondary">
                  <th className="px-4 py-3">Page key</th>
                  <th className="px-4 py-3 w-20">Locale</th>
                  <th className="px-4 py-3 hidden md:table-cell">Title</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Updated</th>
                  <th className="px-4 py-3 w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <PageContentRow key={r.id} content={r} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
