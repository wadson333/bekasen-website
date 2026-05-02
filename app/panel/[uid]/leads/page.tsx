import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { Mail, MessageCircle, Bot, Globe } from "lucide-react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/drizzle/schema";
import { COOKIE_NAMES, verifyAccessToken } from "@/lib/auth";
import { getAdminById } from "@/lib/auth-server";
import { extractPanelUidFromPath } from "@/lib/panel-uid";
import AdminShell from "@/components/cms/AdminShell";
import LeadActions from "@/components/cms/LeadActions";

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

const SOURCE_ICON: Record<string, typeof Globe> = {
  website: Globe,
  chatbot: Bot,
  referral: MessageCircle,
};

export default async function LeadsPage() {
  const uid = await readPanelUid();
  const admin = await requireAdmin();
  if (!admin) redirect(`/panel/${uid}/login`);

  const [active, archived] = await Promise.all([
    db
      .select()
      .from(contactSubmissions)
      .where(eq(contactSubmissions.isArchived, false))
      .orderBy(desc(contactSubmissions.createdAt)),
    db
      .select()
      .from(contactSubmissions)
      .where(eq(contactSubmissions.isArchived, true))
      .orderBy(desc(contactSubmissions.createdAt))
      .limit(20),
  ]);

  return (
    <AdminShell email={admin.email}>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="font-(family-name:--font-syne) text-3xl font-bold text-text-primary">
            Leads
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Contact form + chatbot submissions. Mark qualified, archive, or delete.
          </p>
        </header>

        <section className="rounded-xl border border-border bg-bg-secondary p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-(family-name:--font-syne) text-lg font-bold text-text-primary">
              Inbox <span className="text-sm text-text-secondary font-normal">({active.length})</span>
            </h2>
          </div>

          {active.length === 0 ? (
            <p className="mt-4 text-sm text-text-secondary">
              No active leads right now. New submissions from the contact form (or, soon, the
              OpenRouter chatbot) will appear here.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {active.map((lead) => {
                const Icon = SOURCE_ICON[lead.source] ?? Globe;
                return (
                  <li key={lead.id} className="py-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-500/15 text-purple-300">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text-primary">
                            {lead.name}{" "}
                            {lead.isQualified ? (
                              <span className="ml-1 inline-flex rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                                qualified
                              </span>
                            ) : null}
                          </p>
                          <p className="text-xs text-text-secondary">
                            <a href={`mailto:${lead.email}`} className="hover:text-purple-400">
                              <Mail className="inline h-3 w-3 mr-1" />
                              {lead.email}
                            </a>
                            {lead.projectType ? <> · {lead.projectType}</> : null}
                            {" · "}
                            via {lead.source}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-text-secondary">
                          {new Date(lead.createdAt).toLocaleString()}
                        </span>
                        <LeadActions
                          leadId={lead.id}
                          isArchived={lead.isArchived}
                          isQualified={lead.isQualified}
                        />
                      </div>
                    </div>
                    <p className="mt-3 ml-12 whitespace-pre-wrap text-sm text-text-secondary">
                      {lead.message}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {archived.length > 0 ? (
          <details className="mt-6 rounded-xl border border-border bg-bg-secondary p-6">
            <summary className="cursor-pointer font-(family-name:--font-syne) text-sm font-bold text-text-secondary hover:text-text-primary">
              Archived ({archived.length})
            </summary>
            <ul className="mt-4 divide-y divide-border">
              {archived.map((lead) => (
                <li key={lead.id} className="py-3 opacity-60">
                  <p className="text-sm font-medium text-text-primary">{lead.name}</p>
                  <p className="text-xs text-text-secondary">
                    {lead.email} · {new Date(lead.createdAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </AdminShell>
  );
}
