import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, Sparkles } from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolioProjects, type PortfolioProject } from "@/drizzle/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio",
};

type Locale = "fr" | "en" | "ht" | "es";

const CATEGORY_LABEL: Record<string, Record<Locale, string>> = {
  showcase: { fr: "Vitrine", en: "Showcase", ht: "Vitrin", es: "Vitrina" },
  business: { fr: "Business", en: "Business", ht: "Biznis", es: "Negocios" },
  webapp: { fr: "Application web", en: "Web app", ht: "Aplikasyon web", es: "App web" },
  saas: { fr: "SaaS", en: "SaaS", ht: "SaaS", es: "SaaS" },
};

// Header — punchy headline with a 2-color gradient on the punch word.
const HEADER: Record<Locale, { eyebrow: string; titleBefore: string; titleAccent: string; titleAfter: string; subtitle: string }> = {
  fr: {
    eyebrow: "Portfolio",
    titleBefore: "Pas de pitch deck. ",
    titleAccent: "Du code qui tourne",
    titleAfter: ".",
    subtitle: "Vrais clients. Vraies données. Code source remis. Pas de slides PowerPoint, pas de concepts Figma — juste des sites et des apps qui font le travail aujourd'hui.",
  },
  en: {
    eyebrow: "Portfolio",
    titleBefore: "No pitch decks. ",
    titleAccent: "Just shipping code",
    titleAfter: ".",
    subtitle: "Real clients. Real data. Source code handed over. No slides, no Figma art — just sites and apps doing the job in production right now.",
  },
  ht: {
    eyebrow: "Portfolio",
    titleBefore: "Pa gen pitch deck. ",
    titleAccent: "Sèlman kòd k ap mache",
    titleAfter: ".",
    subtitle: "Vrè kliyan. Vrè done. Kòd sous remèt. Pa gen slides, pa gen Figma — sèlman sit ak app k ap fè travay yo jodi a.",
  },
  es: {
    eyebrow: "Portafolio",
    titleBefore: "Sin pitch decks. ",
    titleAccent: "Solo código que funciona",
    titleAfter: ".",
    subtitle: "Clientes reales. Datos reales. Código fuente entregado. Sin slides, sin Figma — solo sitios y apps haciendo el trabajo hoy mismo.",
  },
};

const VIEW_LABEL: Record<Locale, string> = {
  fr: "Voir le projet",
  en: "View project",
  ht: "Wè pwojè a",
  es: "Ver proyecto",
};

const VIEW_DEMO_LABEL: Record<Locale, string> = {
  fr: "Voir la démo en direct",
  en: "View live demo",
  ht: "Wè demo a",
  es: "Ver demo en vivo",
};

const TECH_STACK_LABEL: Record<Locale, string> = {
  fr: "Stack technique",
  en: "Tech stack",
  ht: "Stack teknik",
  es: "Stack técnico",
};

const FEATURED_LABEL: Record<Locale, string> = {
  fr: "Vedette",
  en: "Featured",
  ht: "Vedèt",
  es: "Destacado",
};

const EMPTY_LABEL: Record<Locale, string> = {
  fr: "Les projets sont en cours d'ajout. Revenez bientôt.",
  en: "Projects are being added. Check back soon.",
  ht: "Pwojè yo ap ajoute. Tounen byento.",
  es: "Los proyectos se están añadiendo. Vuelva pronto.",
};

function pickLocale(value: { fr?: string; en?: string; ht?: string; es?: string }, locale: Locale): string {
  return value[locale] || value.en || value.fr || Object.values(value)[0] || "";
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const header = HEADER[locale];

  const projects = await db
    .select()
    .from(portfolioProjects)
    .where(eq(portfolioProjects.isPublished, true))
    .orderBy(asc(portfolioProjects.displayOrder));

  return (
    <main className="flex-1 px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mx-auto mb-14 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-400">
            <Sparkles className="h-3.5 w-3.5" />
            {header.eyebrow}
          </span>
          <h1 className="mt-6 font-(family-name:--font-syne) text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-text-primary md:text-5xl lg:text-6xl">
            {header.titleBefore}
            <span className="bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent">
              {header.titleAccent}
            </span>
            {header.titleAfter}
          </h1>
          <p className="mt-5 text-lg text-text-secondary">{header.subtitle}</p>
        </header>

        {/* Adaptive layout: 0 / 1 / 2 / 3+ projects */}
        {projects.length === 0 ? (
          <EmptyState locale={locale} />
        ) : projects.length === 1 ? (
          <SingleFeatured project={projects[0]!} locale={locale} />
        ) : (
          <ul
            className={`grid grid-cols-1 gap-6 ${
              projects.length === 2 ? "md:grid-cols-2 md:gap-8" : "sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                locale={locale}
                size={projects.length === 2 ? "large" : "default"}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────

function EmptyState({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-bg-secondary px-6 py-12 text-center">
      <p className="text-sm text-text-secondary">{EMPTY_LABEL[locale]}</p>
    </div>
  );
}

// ─── Single-project featured layout ────────────────────────────────────────
// When the agency only has 1 project to show, the grid would look broken
// (one lonely card). Instead we render a hero-style showcase: large
// browser-framed mockup + side panel with details + CTA.

function SingleFeatured({ project: p, locale }: { project: PortfolioProject; locale: Locale }) {
  const title = pickLocale(p.title, locale);
  const description = pickLocale(p.description, locale);
  const domain = p.demoUrl
    ? p.demoUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : `${p.slug}.bekasen.com`;
  const detailHref = `/${locale}/portfolio/${p.slug}`;

  return (
    <article className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
      {/* Mockup — col 7 */}
      <div className="lg:col-span-7">
        <Link href={detailHref} className="group block cursor-pointer">
          <div className="relative">
            {/* Soft glow behind */}
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-transparent blur-2xl transition-opacity group-hover:opacity-100" />

            <div className="relative overflow-hidden rounded-2xl border border-border bg-bg-card shadow-[0_30px_80px_rgba(15,23,42,0.12)] transition-shadow group-hover:shadow-[0_30px_80px_rgba(124,58,237,0.20)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-border bg-bg-secondary px-5 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400/70" />
                <span className="h-3 w-3 rounded-full bg-amber-400/70" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
                <div className="ml-3 inline-flex items-center gap-1.5 truncate rounded-md bg-bg-card px-3 py-1 text-[11px] text-text-secondary">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {domain}
                </div>
              </div>
              {/* Screenshot */}
              <div className="aspect-[16/10] w-full overflow-hidden bg-bg-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.thumbnailUrl}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  loading="eager"
                />
              </div>
              {p.isFeatured ? (
                <span className="absolute left-5 top-16 rounded-full bg-purple-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-lg">
                  {FEATURED_LABEL[locale]}
                </span>
              ) : null}
            </div>
          </div>
        </Link>
      </div>

      {/* Details — col 5 */}
      <div className="lg:col-span-5">
        <p className="text-[11px] uppercase tracking-wider text-purple-400">
          {CATEGORY_LABEL[p.category]?.[locale] ?? p.category}
        </p>
        <h2 className="mt-3 font-(family-name:--font-syne) text-3xl font-bold leading-tight text-text-primary md:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-text-secondary">{description}</p>

        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {TECH_STACK_LABEL[locale]}
          </p>
          <div className="flex flex-wrap gap-2">
            {p.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border bg-bg-secondary px-3 py-1 text-xs text-text-primary"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href={detailHref}
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-500 cursor-pointer"
          >
            {VIEW_LABEL[locale]} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          {p.demoUrl ? (
            <a
              href={p.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-secondary px-5 py-3 text-sm font-medium text-text-primary transition-colors hover:border-purple-400 hover:text-purple-400 cursor-pointer"
            >
              {VIEW_DEMO_LABEL[locale]} <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

// ─── Card (used in 2-col + 3-col grids) ────────────────────────────────────

function ProjectCard({
  project: p,
  locale,
  size,
}: {
  project: PortfolioProject;
  locale: Locale;
  size: "default" | "large";
}) {
  const title = pickLocale(p.title, locale);
  return (
    <li className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-secondary transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/40 hover:shadow-[0_16px_40px_rgba(124,58,237,0.12)]">
      <Link
        href={`/${locale}/portfolio/${p.slug}`}
        className="flex flex-1 flex-col cursor-pointer"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-bg-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {p.isFeatured ? (
            <span className="absolute right-3 top-3 rounded-full bg-purple-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
              {FEATURED_LABEL[locale]}
            </span>
          ) : null}
        </div>
        <div className={`flex flex-1 flex-col ${size === "large" ? "p-7" : "p-5"}`}>
          <p className="mb-2 text-[11px] uppercase tracking-wider text-purple-400">
            {CATEGORY_LABEL[p.category]?.[locale] ?? p.category}
          </p>
          <h2
            className={`font-(family-name:--font-syne) font-bold text-text-primary group-hover:text-purple-400 transition-colors line-clamp-2 ${
              size === "large" ? "text-2xl" : "text-lg"
            }`}
          >
            {title}
          </h2>
          <p
            className={`mt-2 flex-1 text-text-secondary line-clamp-3 ${
              size === "large" ? "text-base" : "text-sm"
            }`}
          >
            {pickLocale(p.description, locale)}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {p.techStack.slice(0, size === "large" ? 5 : 3).map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border bg-bg-card px-2 py-0.5 text-[10px] text-text-secondary"
              >
                {tech}
              </span>
            ))}
            {p.techStack.length > (size === "large" ? 5 : 3) ? (
              <span className="text-[10px] text-text-secondary opacity-60 self-center">
                +{p.techStack.length - (size === "large" ? 5 : 3)}
              </span>
            ) : null}
          </div>
          <span className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-purple-400 group-hover:text-purple-300">
            {VIEW_LABEL[locale]} <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    </li>
  );
}
