import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronLeft } from "lucide-react";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolioProjects } from "@/drizzle/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Locale = "fr" | "en" | "ht" | "es";
type Params = { locale: Locale; slug: string };

const CATEGORY_LABEL: Record<string, Record<Locale, string>> = {
  showcase: { fr: "Vitrine", en: "Showcase", ht: "Vitrin", es: "Vitrina" },
  business: { fr: "Business", en: "Business", ht: "Biznis", es: "Negocios" },
  webapp: { fr: "Application web", en: "Web app", ht: "Aplikasyon web", es: "App web" },
  saas: { fr: "SaaS", en: "SaaS", ht: "SaaS", es: "SaaS" },
};

const BACK_LABEL: Record<Locale, string> = {
  fr: "Retour au portfolio",
  en: "Back to portfolio",
  ht: "Tounen nan portfolio",
  es: "Volver al portafolio",
};

const VIEW_LIVE_LABEL: Record<Locale, string> = {
  fr: "Voir la démo en direct",
  en: "View live demo",
  ht: "Wè demo a",
  es: "Ver demo en vivo",
};

const TECH_LABEL: Record<Locale, string> = {
  fr: "Stack technique",
  en: "Tech stack",
  ht: "Stack teknik",
  es: "Stack técnico",
};

const START_PROJECT_LABEL: Record<Locale, string> = {
  fr: "Démarrer un projet similaire",
  en: "Start a similar project",
  ht: "Kòmanse yon pwojè parèy",
  es: "Empezar un proyecto similar",
};

function pickLocale(value: { fr?: string; en?: string; ht?: string; es?: string }, locale: Locale): string {
  return value[locale] || value.en || value.fr || Object.values(value)[0] || "";
}

async function getProject(slug: string) {
  const [row] = await db
    .select()
    .from(portfolioProjects)
    .where(and(eq(portfolioProjects.slug, slug), eq(portfolioProjects.isPublished, true)))
    .limit(1);
  return row ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Not found" };
  return {
    title: pickLocale(project.title, locale),
    description: pickLocale(project.description, locale),
    openGraph: {
      title: pickLocale(project.title, locale),
      description: pickLocale(project.description, locale),
      images: [project.thumbnailUrl],
    },
  };
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const title = pickLocale(project.title, locale);
  const description = pickLocale(project.description, locale);

  return (
    <main className="flex-1 px-6 py-12 lg:py-16">
      <article className="mx-auto max-w-4xl">
        <Link
          href={`/${locale}/portfolio`}
          className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-purple-400 hover:text-purple-300 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          {BACK_LABEL[locale]}
        </Link>

        <header className="mb-10">
          <p className="mb-3 text-[11px] uppercase tracking-wider text-purple-400">
            {CATEGORY_LABEL[project.category]?.[locale] ?? project.category}
          </p>
          <h1 className="font-(family-name:--font-syne) text-3xl font-bold text-text-primary lg:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-lg text-text-secondary">{description}</p>
        </header>

        {project.thumbnailUrl ? (
          <div className="relative mb-12 overflow-hidden rounded-xl border border-border bg-bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.thumbnailUrl}
              alt={title}
              className="aspect-video w-full object-cover"
            />
          </div>
        ) : null}

        <section className="mb-12">
          <h2 className="font-(family-name:--font-syne) mb-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {TECH_LABEL[locale]}
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border bg-bg-secondary px-3 py-1 text-sm text-text-primary"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {project.demoUrl ? (
          <div className="mb-12 flex flex-wrap items-center gap-4">
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-500 cursor-pointer"
            >
              {VIEW_LIVE_LABEL[locale]}
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <span className="text-xs text-text-secondary opacity-70">
              {project.demoUrl.replace(/^https?:\/\//, "")}
            </span>
          </div>
        ) : null}

        <aside className="rounded-xl border border-purple-500/30 bg-bg-secondary px-6 py-8 text-center">
          <p className="text-sm text-text-secondary mb-4">
            {locale === "fr"
              ? "Vous voulez un projet de cette qualité pour votre entreprise ?"
              : locale === "ht"
                ? "Èske ou vle yon pwojè pou kalite sa pou biznis ou?"
                : locale === "es"
                  ? "¿Quiere un proyecto de esta calidad para su empresa?"
                  : "Want a project of this quality for your business?"}
          </p>
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-500 cursor-pointer"
          >
            {START_PROJECT_LABEL[locale]}
          </Link>
        </aside>
      </article>
    </main>
  );
}
