import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolioProjects } from "@/drizzle/schema";
import NumberCounter from "@/components/ui/NumberCounter";

type Locale = "fr" | "en" | "ht" | "es";

const COPY: Record<Locale, { projects: string; languages: string; uptime: string; replyHours: string }> = {
  fr: { projects: "Projets livrés", languages: "Langues supportées", uptime: "Uptime garanti", replyHours: "Réponse en moins de" },
  en: { projects: "Projects shipped", languages: "Languages supported", uptime: "Guaranteed uptime", replyHours: "Reply within" },
  ht: { projects: "Pwojè delivre", languages: "Lang sipòte", uptime: "Uptime garanti", replyHours: "Repons mwens pase" },
  es: { projects: "Proyectos entregados", languages: "Idiomas soportados", uptime: "Uptime garantizado", replyHours: "Respuesta en" },
};

/**
 * StatsStrip — 4 animated counters on a single horizontal band.
 *
 * Sits between MockupMarquee and TechMarquee. Builds credibility with hard
 * numbers (number of shipped projects pulled live from the DB, plus 3
 * marketing claims).
 *
 * Each counter ticks from 0 to its target on scroll-into-view (uses the
 * existing NumberCounter component, which honors prefers-reduced-motion).
 */
export default async function StatsStrip({ locale }: { locale: Locale }) {
  const projects = await db
    .select({ id: portfolioProjects.id })
    .from(portfolioProjects)
    .where(eq(portfolioProjects.isPublished, true));

  const projectsCount = projects.length || 4;
  const copy = COPY[locale];

  const stats = [
    { value: projectsCount, suffix: "+", label: copy.projects },
    { value: 4, suffix: "", label: copy.languages },
    { value: 999, prefix: "99.", suffix: "%", label: copy.uptime, raw: "99.9%" },
    { value: 24, suffix: "h", label: copy.replyHours },
  ];

  return (
    <section className="relative bg-bg-primary py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-3xl border border-border bg-bg-card px-6 py-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] dark:shadow-none lg:px-12 lg:py-10">
          <div className="grid grid-cols-2 gap-8 sm:gap-12 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center md:text-left">
                <p className="font-(family-name:--font-syne) text-3xl font-bold text-purple-500 sm:text-4xl">
                  {s.raw ? (
                    <span>{s.raw}</span>
                  ) : (
                    <NumberCounter
                      to={s.value}
                      prefix={s.prefix ?? ""}
                      suffix={s.suffix}
                    />
                  )}
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-wider text-text-secondary sm:text-sm">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
