import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { portfolioProjects } from "@/drizzle/schema";
import DeviceShowcase from "@/components/home/DeviceShowcase";

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

const VIEW_LABEL: Record<Locale, string> = {
  fr: "Voir le projet",
  en: "View project",
  ht: "Wè pwojè a",
  es: "Ver proyecto",
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
  const t = await getTranslations({ locale, namespace: "portfolio" });

  const projects = await db
    .select()
    .from(portfolioProjects)
    .where(eq(portfolioProjects.isPublished, true))
    .orderBy(asc(portfolioProjects.displayOrder));

  return (
    <main className="flex-1">
      {/* Page header */}
      <div className="px-6 pt-16 lg:pt-24">
        <div className="mx-auto max-w-6xl">
          <header className="mb-12 text-center">
            <h1 className="font-(family-name:--font-syne) text-4xl font-bold lg:text-5xl">
              <span className="bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent">
                {t("title")}
              </span>
            </h1>
            <p className="mt-3 text-text-secondary max-w-2xl mx-auto">
              {locale === "fr"
                ? "Sélection de projets livrés et déployés en production. Chaque projet inclut le code source et la maintenance."
                : locale === "ht"
                  ? "Seleksyon pwojè ki delivre ak deplwaye nan pwodiksyon. Chak pwojè gen kòd sous li ak antretyen."
                  : locale === "es"
                    ? "Selección de proyectos entregados y desplegados en producción. Cada proyecto incluye código fuente y mantenimiento."
                    : "Selected projects delivered and deployed in production. Each project includes source code and maintenance."}
            </p>
          </header>
        </div>
      </div>

      {/* Device showcase — featured project across desktop / tablet / mobile viewports */}
      {projects.length > 0 ? <DeviceShowcase locale={locale} /> : null}

      {/* Grid */}
      <div className="px-6 pb-16 lg:pb-24">
        <div className="mx-auto max-w-6xl">
          {projects.length === 0 ? (
          <div className="mx-auto max-w-md rounded-xl border border-dashed border-border bg-bg-secondary px-6 py-12 text-center">
            <p className="text-sm text-text-secondary">{EMPTY_LABEL[locale]}</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <li
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-bg-secondary transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <Link
                  href={`/${locale}/portfolio/${p.slug}`}
                  className="flex flex-1 flex-col cursor-pointer"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-bg-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.thumbnailUrl}
                      alt={pickLocale(p.title, locale)}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {p.isFeatured ? (
                      <span className="absolute top-3 right-3 rounded-full bg-purple-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                        {locale === "fr" ? "Vedette" : locale === "ht" ? "Vedèt" : locale === "es" ? "Destacado" : "Featured"}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="mb-2 text-[11px] uppercase tracking-wider text-purple-400">
                      {CATEGORY_LABEL[p.category]?.[locale] ?? p.category}
                    </p>
                    <h2 className="font-(family-name:--font-syne) text-lg font-bold text-text-primary group-hover:text-purple-400 transition-colors line-clamp-2">
                      {pickLocale(p.title, locale)}
                    </h2>
                    <p className="mt-2 flex-1 text-sm text-text-secondary line-clamp-3">
                      {pickLocale(p.description, locale)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.techStack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-border bg-bg-card px-2 py-0.5 text-[10px] text-text-secondary"
                        >
                          {tech}
                        </span>
                      ))}
                      {p.techStack.length > 3 ? (
                        <span className="text-[10px] text-text-secondary opacity-60 self-center">
                          +{p.techStack.length - 3}
                        </span>
                      ) : null}
                    </div>
                    <span className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-purple-400 group-hover:text-purple-300">
                      {VIEW_LABEL[locale]} <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        </div>
      </div>
    </main>
  );
}
