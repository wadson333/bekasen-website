import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { count } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  clientProjects,
  contactSubmissions,
  portfolioProjects,
  blogPosts,
} from "@/drizzle/schema";
import { COOKIE_NAMES, verifyAccessToken } from "@/lib/auth";
import { getAdminById } from "@/lib/auth-server";
import { Button } from "@/components/cms/ui/button";

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

type PanelParams = { uid: string };

export default async function DashboardPage(
  props: PageProps<"/panel-[uid]/dashboard">,
) {
  const { uid } = (await props.params) as PanelParams;
  const admin = await requireAdmin();
  if (!admin) redirect(`/panel-${uid}/login`);

  // Stats per spec section 7.1 dashboard overview
  const [[clientsRow], [leadsRow], [portfolioRow], [blogRow]] = await Promise.all([
    db.select({ c: count() }).from(clientProjects),
    db.select({ c: count() }).from(contactSubmissions),
    db.select({ c: count() }).from(portfolioProjects),
    db.select({ c: count() }).from(blogPosts),
  ]);

  const stats = [
    { label: "Active client projects", value: clientsRow?.c ?? 0, href: `/panel-${uid}/clients` },
    { label: "Pending leads", value: leadsRow?.c ?? 0, href: `/panel-${uid}/leads` },
    { label: "Portfolio entries", value: portfolioRow?.c ?? 0, href: `/panel-${uid}/portfolio` },
    { label: "Blog posts", value: blogRow?.c ?? 0, href: `/panel-${uid}/blog` },
  ];

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-400">
              Bekasen Panel
            </p>
            <h1 className="mt-1 font-(family-name:--font-syne) text-3xl font-bold text-text-primary">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-text-secondary">{admin.email}</p>
          </div>
          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="secondary" size="sm">
              Log out
            </Button>
          </form>
        </header>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="rounded-xl border border-border bg-bg-secondary p-5 transition-colors hover:border-purple-500/40"
            >
              <p className="text-xs uppercase tracking-wider text-text-secondary">
                {s.label}
              </p>
              <p className="mt-2 text-3xl font-bold text-text-primary">{s.value}</p>
            </Link>
          ))}
        </section>

        <section className="mt-10 rounded-xl border border-border bg-bg-secondary p-6">
          <h2 className="font-(family-name:--font-syne) text-xl font-bold text-text-primary">
            Quick actions
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            More CMS pages coming online next: Content editor, Portfolio
            manager, Pricing editor, Blog manager, Clients, Leads.
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-2 text-sm text-text-secondary lg:grid-cols-2">
            <li>• /panel-{uid}/content — edit page copy (Tiptap)</li>
            <li>• /panel-{uid}/portfolio — manage demo projects</li>
            <li>• /panel-{uid}/pricing — edit Starter / Business / Premium</li>
            <li>• /panel-{uid}/blog — markdown post editor</li>
            <li>• /panel-{uid}/clients — token-gated client dashboards</li>
            <li>• /panel-{uid}/leads — contact form + chatbot leads inbox</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
