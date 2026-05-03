import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Globe, Clock, Wallet, ArrowRight, ArrowUpRight, Search, Code, Rocket, TrendingUp, type LucideIcon } from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolioProjects } from "@/drizzle/schema";
import InitialsAvatar from "@/components/about/InitialsAvatar";
import LinkedinIcon from "@/components/icons/LinkedinIcon";
import CalBookingButton from "@/components/CalBookingButton";
import { CONTACT, SITE } from "@/lib/contact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Locale = "fr" | "en" | "ht" | "es";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const title = t("title");
  const description = t("description");
  const ogImage = `${SITE.url}/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(description)}`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE.url}/${locale}/about` },
    openGraph: {
      title,
      description,
      url: `${SITE.url}/${locale}/about`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

function pickLocale(value: { fr?: string; en?: string; ht?: string; es?: string }, locale: Locale): string {
  return value[locale] || value.en || value.fr || Object.values(value)[0] || "";
}

const PROCESS_STEPS: { key: "step1" | "step2" | "step3" | "step4"; Icon: LucideIcon }[] = [
  { key: "step1", Icon: Search },
  { key: "step2", Icon: Code },
  { key: "step3", Icon: Rocket },
  { key: "step4", Icon: TrendingUp },
];

const STATS_LABELS: Record<Locale, { projects: string; languages: string; capacity: string; capacityNote: string }> = {
  fr: { projects: "Projets livrés", languages: "Langues supportées", capacity: "Projets ce trimestre", capacityNote: "Plus que quelques places" },
  en: { projects: "Projects shipped", languages: "Languages supported", capacity: "Projects this quarter", capacityNote: "Only a few slots left" },
  ht: { projects: "Pwojè delivre", languages: "Lang sipòte", capacity: "Pwojè trimès sa", capacityNote: "Sèlman kèk plas ki rete" },
  es: { projects: "Proyectos entregados", languages: "Idiomas soportados", capacity: "Proyectos este trimestre", capacityNote: "Solo quedan pocos cupos" },
};

const SECTION_LABELS: Record<Locale, { workTitle: string; workDescription: string; workSeeAll: string; processTitle: string; processSubtitle: string; ctaTitle: string; ctaSubtitle: string; ctaButton: string }> = {
  fr: {
    workTitle: "Ce qu'on construit",
    workDescription: "Sélection de projets récents — sites, applications métier, chatbots IA.",
    workSeeAll: "Voir tout le portfolio",
    processTitle: "Notre processus",
    processSubtitle: "4 étapes simples, livrables clairs, pas de surprise.",
    ctaTitle: "On en parle ?",
    ctaSubtitle: "15 minutes au téléphone pour comprendre votre besoin et voir si on peut vous aider.",
    ctaButton: "Réserver un appel gratuit",
  },
  en: {
    workTitle: "What we build",
    workDescription: "Recent projects — websites, business apps, AI chatbots.",
    workSeeAll: "View full portfolio",
    processTitle: "Our process",
    processSubtitle: "4 simple steps, clear deliverables, no surprises.",
    ctaTitle: "Let's talk?",
    ctaSubtitle: "15 minutes on a call to understand your need and see if we can help.",
    ctaButton: "Book a free call",
  },
  ht: {
    workTitle: "Sa nou bati",
    workDescription: "Seleksyon pwojè dènye — sit, aplikasyon biznis, chatbot AI.",
    workSeeAll: "Wè tout portfolio a",
    processTitle: "Pwosesis nou",
    processSubtitle: "4 etap senp, livrezon klè, san sipriz.",
    ctaTitle: "Ann pale?",
    ctaSubtitle: "15 minit nan telefòn pou konprann bezwen w epi wè si nou ka ede w.",
    ctaButton: "Rezève yon apèl gratis",
  },
  es: {
    workTitle: "Lo que construimos",
    workDescription: "Selección de proyectos recientes — sitios, apps empresariales, chatbots IA.",
    workSeeAll: "Ver todo el portafolio",
    processTitle: "Nuestro proceso",
    processSubtitle: "4 pasos simples, entregas claras, sin sorpresas.",
    ctaTitle: "¿Hablamos?",
    ctaSubtitle: "15 minutos al teléfono para entender tu necesidad y ver si podemos ayudar.",
    ctaButton: "Reservar llamada gratis",
  },
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const tProcess = await getTranslations({ locale, namespace: "processTimeline" });
  const labels = SECTION_LABELS[locale];
  const statLabels = STATS_LABELS[locale];

  // Top featured projects for the "What we build" mini-grid
  const featuredProjects = await db
    .select()
    .from(portfolioProjects)
    .where(eq(portfolioProjects.isPublished, true))
    .orderBy(asc(portfolioProjects.displayOrder))
    .limit(4);

  // Total published projects (for stat badge)
  const allProjects = await db
    .select({ id: portfolioProjects.id })
    .from(portfolioProjects)
    .where(eq(portfolioProjects.isPublished, true));

  const projectsCount = allProjects.length;

  return (
    <main className="flex flex-col min-h-screen pt-32">
      {/* Hero */}
      <section className="px-6 pb-12 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 font-(family-name:--font-syne) text-5xl font-bold text-text-primary md:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="text-xl text-text-secondary">{t("hero.subtitle")}</p>
        </div>
      </section>

      {/* Stat badges */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-4xl">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <li className="rounded-2xl border border-border bg-bg-card px-6 py-5 text-center">
              <p className="font-(family-name:--font-syne) text-3xl font-bold text-purple-400">
                {projectsCount > 0 ? projectsCount : "4+"}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-text-secondary">{statLabels.projects}</p>
            </li>
            <li className="rounded-2xl border border-border bg-bg-card px-6 py-5 text-center">
              <p className="font-(family-name:--font-syne) text-3xl font-bold text-purple-400">4</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-text-secondary">{statLabels.languages}</p>
            </li>
            <li className="rounded-2xl border border-purple-500/40 bg-purple-500/5 px-6 py-5 text-center">
              <p className="font-(family-name:--font-syne) text-3xl font-bold text-purple-400">4</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-text-secondary">{statLabels.capacity}</p>
              <p className="mt-1 text-[10px] text-purple-400 opacity-80">{statLabels.capacityNote}</p>
            </li>
          </ul>
        </div>
      </section>

      {/* The Agency */}
      <section className="border-y border-border bg-bg-secondary px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-6 font-(family-name:--font-syne) text-3xl font-bold text-text-primary md:text-4xl">
            {t("story.title")}
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-text-secondary">
            {t("story.content")}
          </p>

          {/* Diaspora Promise */}
          <div className="mt-12 rounded-3xl border border-purple-500/20 bg-purple-500/5 p-8">
            <h3 className="mb-6 font-(family-name:--font-syne) text-xl font-bold text-text-primary md:text-2xl">
              {t("diasporaPromise.title")}
            </h3>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <li className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                  <Globe className="h-5 w-5" />
                </span>
                <span className="text-sm leading-relaxed text-text-secondary">{t("diasporaPromise.remote")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                  <Clock className="h-5 w-5" />
                </span>
                <span className="text-sm leading-relaxed text-text-secondary">{t("diasporaPromise.response")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                  <Wallet className="h-5 w-5" />
                </span>
                <span className="text-sm leading-relaxed text-text-secondary">{t("diasporaPromise.pay")}</span>
              </li>
            </ul>
          </div>

          <p className="mt-10 text-center text-sm italic text-text-secondary">{t("story.passion")}</p>
        </div>
      </section>

      {/* What we build */}
      {featuredProjects.length > 0 ? (
        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-col items-center gap-4 text-center md:flex-row md:items-end md:justify-between md:text-left">
              <div>
                <h2 className="font-(family-name:--font-syne) text-3xl font-bold text-text-primary md:text-4xl">
                  {labels.workTitle}
                </h2>
                <p className="mt-2 text-text-secondary">{labels.workDescription}</p>
              </div>
              <Link
                href={`/${locale}/portfolio`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-secondary px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-purple-400 hover:text-purple-400 cursor-pointer"
              >
                {labels.workSeeAll} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {featuredProjects.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/${locale}/portfolio/${p.slug}`}
                    className="group block overflow-hidden rounded-2xl border border-border bg-bg-secondary transition-all hover:border-purple-500/40 hover:-translate-y-0.5 cursor-pointer"
                  >
                    <div className="aspect-video w-full overflow-hidden bg-bg-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.thumbnailUrl}
                        alt={pickLocale(p.title, locale)}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-text-primary line-clamp-1 group-hover:text-purple-400">
                        {pickLocale(p.title, locale)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Process recap */}
      <section className="border-y border-border bg-bg-secondary px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <header className="mb-12 text-center">
            <h2 className="font-(family-name:--font-syne) text-3xl font-bold text-text-primary md:text-4xl">
              {labels.processTitle}
            </h2>
            <p className="mt-2 text-text-secondary">{labels.processSubtitle}</p>
          </header>
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {PROCESS_STEPS.map((step, idx) => {
              const Icon = step.Icon;
              return (
                <li
                  key={step.key}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-bg-card px-5 py-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <span className="font-(family-name:--font-syne) text-[10px] font-semibold uppercase tracking-wider text-purple-400">
                      0{idx + 1}
                    </span>
                    <h3 className="mt-1 font-(family-name:--font-syne) text-base font-bold text-text-primary">
                      {tProcess(`${step.key}Title`)}
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                      {tProcess(`${step.key}Description`)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Founder */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center gap-12 md:flex-row md:items-start">
            <InitialsAvatar
              initials="WJ"
              size={192}
              className="shrink-0 shadow-[0_20px_60px_rgba(139,92,246,0.35)]"
            />
            <div>
              <span className="mb-4 inline-block rounded-full border border-border bg-bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider text-text-secondary">
                {t("founder.badge")}
              </span>
              <h2 className="mb-2 font-(family-name:--font-syne) text-4xl font-bold text-text-primary">
                {t("founder.name")}
              </h2>
              <p className="mb-6 text-xl text-text-secondary">{t("founder.role")}</p>
              <p className="mb-6 text-lg italic leading-relaxed text-text-primary">
                &quot;{t("founder.vision")}&quot;
              </p>
              <p className="mb-6 text-base leading-relaxed text-text-secondary">{t("founder.bio")}</p>
              <a
                href={CONTACT.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#0A66C2] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0a5cb0] cursor-pointer"
              >
                <LinkedinIcon className="h-4 w-4" />
                LinkedIn — {SITE.founder}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-purple-500/20 bg-purple-500/5 p-10 text-center">
          <h2 className="font-(family-name:--font-syne) text-3xl font-bold text-text-primary md:text-4xl">
            {labels.ctaTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-text-secondary">{labels.ctaSubtitle}</p>
          <div className="mt-8">
            <CalBookingButton
              type="discovery15"
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-500 cursor-pointer"
            >
              {labels.ctaButton}
              <ArrowUpRight className="h-4 w-4" />
            </CalBookingButton>
          </div>
        </div>
      </section>
    </main>
  );
}
