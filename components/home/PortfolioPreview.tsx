import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { portfolioProjects } from "@/drizzle/schema";
import Reveal from "@/components/ui/Reveal";

type Locale = "fr" | "en" | "ht" | "es";

const CATEGORY_LABEL: Record<string, Record<Locale, string>> = {
  showcase: { fr: "Vitrine", en: "Showcase", ht: "Vitrin", es: "Vitrina" },
  business: { fr: "Business", en: "Business", ht: "Biznis", es: "Negocios" },
  webapp: { fr: "Application web", en: "Web app", ht: "Aplikasyon web", es: "App web" },
  saas: { fr: "SaaS", en: "SaaS", ht: "SaaS", es: "SaaS" },
};

const VIEW_ALL_LABEL: Record<Locale, string> = {
  fr: "Voir tout le portfolio",
  en: "View all projects",
  ht: "Wè tout pwojè yo",
  es: "Ver todo el portafolio",
};

const VIEW_LABEL: Record<Locale, string> = {
  fr: "Voir le projet",
  en: "View project",
  ht: "Wè pwojè a",
  es: "Ver proyecto",
};

function pickLocale(value: { fr?: string; en?: string; ht?: string; es?: string }, locale: Locale): string {
  return value[locale] || value.en || value.fr || Object.values(value)[0] || "";
}

/**
 * Homepage portfolio preview — server component, reads the top 6 published
 * portfolio projects (featured first, then by display order) directly from
 * the DB. Replaces the old hardcoded PortfolioSection (613 lines, 4 fixed
 * projects) — admin Portfolio CMS additions now show on the homepage too.
 *
 * Keeps the `id="portfolio"` anchor so existing scroll links still resolve.
 *
 * Layout per the brief: clean 3-col grid, hover lift, click → /portfolio/[slug]
 * detail page. No carousel, no mockup mockery, no parallax.
 */
export default async function PortfolioPreview({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "portfolioSection" });

  const projects = await db
    .select()
    .from(portfolioProjects)
    .where(eq(portfolioProjects.isPublished, true))
    .orderBy(asc(portfolioProjects.displayOrder))
    .limit(6);

  if (projects.length === 0) return null;

  return (
    <section id="portfolio" className="bg-bg-primary py-24">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-12 flex flex-col items-center gap-4 text-center md:flex-row md:items-end md:justify-between md:text-left">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-400">
              {t("badge")}
            </span>
            <h2 className="mt-4 font-(family-name:--font-syne) text-3xl font-bold text-text-primary md:text-5xl">
              {t("title")}
            </h2>
          </div>
          <Link
            href={`/${locale}/portfolio`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-secondary px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-purple-400 hover:text-purple-400 cursor-pointer"
          >
            {VIEW_ALL_LABEL[locale]} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </header>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, idx) => (
            <Reveal key={p.id} as="li" delay={(idx % 3) * 0.08} from="up">
              <Link
                href={`/${locale}/portfolio/${p.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-bg-secondary transition-all duration-300 hover:border-purple-500/40 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(124,58,237,0.12)] cursor-pointer"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-bg-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.thumbnailUrl}
                    alt={pickLocale(p.title, locale)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="mb-2 text-[11px] uppercase tracking-wider text-purple-400">
                    {CATEGORY_LABEL[p.category]?.[locale] ?? p.category}
                  </p>
                  <h3 className="font-(family-name:--font-syne) text-lg font-bold text-text-primary line-clamp-2 group-hover:text-purple-400 transition-colors">
                    {pickLocale(p.title, locale)}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-text-secondary line-clamp-2">
                    {pickLocale(p.description, locale)}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {p.techStack.slice(0, 2).map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-border bg-bg-card px-2 py-0.5 text-[10px] text-text-secondary"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-400 group-hover:text-purple-300">
                      {VIEW_LABEL[locale]} <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
