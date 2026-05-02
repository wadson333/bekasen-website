import Link from "next/link";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  clientProjects,
  contactSubmissions,
  portfolioProjects,
  blogPosts,
} from "@/drizzle/schema";
import { COOKIE_NAMES, verifyAccessToken } from "@/lib/auth";
import { getAdminById } from "@/lib/auth-server";
import { extractPanelUidFromPath } from "@/lib/panel-uid";
import AdminShell from "@/components/cms/AdminShell";

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
  const pathname =
    h.get("x-invoke-path") ??
    h.get("next-url") ??
    h.get("x-pathname") ??
    "";
  return extractPanelUidFromPath(pathname) ?? "";
}

export default async function DashboardPage() {
  const uid = await readPanelUid();
  const admin = await requireAdmin();
  if (!admin) redirect(`/panel/${uid}/login`);

  // Stats per spec section 7.1
  const [[clientsRow], [activeClientsRow], [leadsRow], [unreadLeadsRow], recentClients] =
    await Promise.all([
      db.select({ c: count() }).from(clientProjects),
      db
        .select({ c: count() })
        .from(clientProjects)
        .where(eq(clientProjects.isActive, true)),
      db.select({ c: count() }).from(contactSubmissions),
      db
        .select({ c: count() })
        .from(contactSubmissions)
        .where(eq(contactSubmissions.isArchived, false)),
      db
        .select()
        .from(clientProjects)
        .where(eq(clientProjects.isActive, true))
        .orderBy(desc(clientProjects.updatedAt))
        .limit(5),
    ]);

  const [[portfolioRow], [blogRow]] = await Promise.all([
    db.select({ c: count() }).from(portfolioProjects),
    db.select({ c: count() }).from(blogPosts),
  ]);

  const stats = [
    {
      label: "Active client projects",
      value: activeClientsRow?.c ?? 0,
      sub: `${clientsRow?.c ?? 0} total (incl. archived)`,
      href: `/panel/${uid}/clients`,
      tone: "purple" as const,
    },
    {
      label: "Pending leads",
      value: unreadLeadsRow?.c ?? 0,
      sub: `${leadsRow?.c ?? 0} total submissions`,
      href: `/panel/${uid}/leads`,
      tone: "amber" as const,
    },
    {
      label: "Portfolio projects",
      value: portfolioRow?.c ?? 0,
      sub: "Showcase + business + webapp",
      href: `/panel/${uid}/portfolio`,
      tone: "sky" as const,
    },
    {
      label: "Blog posts",
      value: blogRow?.c ?? 0,
      sub: "Published + drafts",
      href: `/panel/${uid}/blog`,
      tone: "emerald" as const,
    },
  ];

  const TONE_BORDER: Record<string, string> = {
    purple: "border-purple-500/30 hover:border-purple-500/60",
    amber: "border-amber-500/30 hover:border-amber-500/60",
    sky: "border-sky-500/30 hover:border-sky-500/60",
    emerald: "border-emerald-500/30 hover:border-emerald-500/60",
  };

  return (
    <AdminShell email={admin.email}>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <h1 className="font-(family-name:--font-syne) text-3xl font-bold text-text-primary">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Quick overview of your business activity.
          </p>
        </header>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className={`rounded-xl border bg-bg-secondary p-5 transition-colors ${TONE_BORDER[s.tone]}`}
            >
              <p className="text-xs uppercase tracking-wider text-text-secondary">
                {s.label}
              </p>
              <p className="mt-2 text-3xl font-bold text-text-primary">{s.value}</p>
              <p className="mt-1 text-xs text-text-secondary">{s.sub}</p>
            </Link>
          ))}
        </section>

        <section className="mt-10 rounded-xl border border-border bg-bg-secondary p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-(family-name:--font-syne) text-xl font-bold text-text-primary">
              Recent client projects
            </h2>
            <Link
              href={`/panel/${uid}/clients`}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              View all →
            </Link>
          </div>

          {recentClients.length === 0 ? (
            <p className="mt-4 text-sm text-text-secondary">
              No client projects yet. Create one from the{" "}
              <Link
                href={`/panel/${uid}/clients`}
                className="text-purple-400 hover:underline"
              >
                Clients page
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {recentClients.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/panel/${uid}/clients/${p.id}`}
                      className="text-sm font-medium text-text-primary hover:text-purple-400 truncate block"
                    >
                      {p.projectTitle}
                    </Link>
                    <p className="text-xs text-text-secondary">
                      {p.clientName} · {p.status} · {p.progressPct}%
                    </p>
                  </div>
                  <span className="text-xs text-text-secondary whitespace-nowrap ml-4">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
