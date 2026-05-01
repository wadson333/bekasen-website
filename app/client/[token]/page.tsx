import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  clientProjects,
  projectMilestones,
  projectMessages,
  projectDeliverables,
} from "@/drizzle/schema";
import { CONTACT, SITE } from "@/lib/contact";
import StatusBanner from "@/components/client-dashboard/StatusBanner";
import MilestoneTimeline from "@/components/client-dashboard/MilestoneTimeline";
import DeliverableList from "@/components/client-dashboard/DeliverableList";
import ClientMessageThread from "@/components/client-dashboard/ClientMessageThread";
import type { ClientStatus } from "@/lib/validation/clients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ClientDashboardParams = { token: string };

const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

const COPY: Record<string, { contactCta: string; poweredBy: string; lastUpdated: string }> = {
  en: { contactCta: "Talk to your team", poweredBy: "Powered by", lastUpdated: "Last updated" },
  fr: { contactCta: "Parler à votre équipe", poweredBy: "Propulsé par", lastUpdated: "Dernière mise à jour" },
  ht: { contactCta: "Pale ak ekip ou", poweredBy: "Pwopilse pa", lastUpdated: "Dènye mizajou" },
  es: { contactCta: "Hablar con tu equipo", poweredBy: "Impulsado por", lastUpdated: "Última actualización" },
};

export default async function ClientDashboardPage(props: PageProps<"/client/[token]">) {
  const { token } = (await props.params) as ClientDashboardParams;

  if (!TOKEN_PATTERN.test(token)) notFound();

  const [project] = await db
    .select()
    .from(clientProjects)
    .where(and(eq(clientProjects.accessToken, token), eq(clientProjects.isActive, true)))
    .limit(1);

  if (!project) notFound();

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

  const safeLocale = ["en", "fr", "ht", "es"].includes(project.locale)
    ? project.locale
    : "en";
  const t = COPY[safeLocale] ?? COPY.en;

  return (
    <main className="min-h-screen pb-20">
      {/* Header — logo + project + client name. No site nav per spec 8.3. */}
      <header className="border-b border-border bg-bg-secondary/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href={SITE.url} className="relative h-7 w-28 shrink-0">
            <Image
              src="/logo-dark-clean.png"
              alt="Bekasen"
              fill
              sizes="112px"
              className="object-contain block dark:hidden"
            />
            <Image
              src="/logo-clean.png"
              alt="Bekasen"
              fill
              sizes="112px"
              className="object-contain hidden dark:block"
            />
          </Link>
          <div className="text-right text-sm">
            <p className="font-semibold text-text-primary">{project.projectTitle}</p>
            <p className="text-text-secondary">{project.clientName}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-6 px-6">
        <StatusBanner
          status={project.status as ClientStatus}
          progressPct={project.progressPct}
          locale={safeLocale}
        />

        {project.notesForClient ? (
          <section className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">
            <p className="whitespace-pre-wrap text-sm text-text-primary">
              {project.notesForClient}
            </p>
          </section>
        ) : null}

        <MilestoneTimeline milestones={milestones} locale={safeLocale} />
        <DeliverableList deliverables={deliverables} locale={safeLocale} />
        <ClientMessageThread
          token={token}
          initialMessages={messages}
          locale={safeLocale}
        />

        {/* Contact CTA — WhatsApp shortcut per spec 8.3 */}
        <a
          href={CONTACT.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 py-4 text-sm font-medium text-white transition-colors hover:bg-green-500"
        >
          {t.contactCta} →
        </a>

        <p className="text-center text-xs text-text-secondary">
          {t.lastUpdated}: {new Date(project.updatedAt).toLocaleString(safeLocale)}
        </p>

        {/* Footer per spec 8.3.16 */}
        <p className="mt-4 text-center text-xs text-text-secondary">
          {t.poweredBy}{" "}
          <Link href={SITE.url} className="text-purple-400 hover:underline">
            Bekasen
          </Link>
        </p>
      </div>
    </main>
  );
}
