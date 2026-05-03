import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolioProjects } from "@/drizzle/schema";

type Locale = "fr" | "en" | "ht" | "es";

function pickLocale(value: { fr?: string; en?: string; ht?: string; es?: string }, locale: Locale): string {
  return value[locale] || value.en || value.fr || Object.values(value)[0] || "";
}

/**
 * MockupMarquee — infinite horizontal scroll of portfolio thumbnails framed
 * in browser chrome (Pacivra-inspired, but auto-scrolling instead of static).
 *
 * Sits right below the hero. Reads from the DB. Each item is wrapped in a
 * compact macOS-style browser frame with traffic-light dots and the project
 * URL. Pauses on hover (hover:[animation-play-state:paused]).
 *
 * Uses the existing `animate-marquee` keyframe defined in globals.css and
 * `motion-reduce:animate-none` so prefers-reduced-motion is honored.
 */
export default async function MockupMarquee({ locale }: { locale: Locale }) {
  const projects = await db
    .select()
    .from(portfolioProjects)
    .where(eq(portfolioProjects.isPublished, true))
    .orderBy(asc(portfolioProjects.displayOrder));

  if (projects.length === 0) return null;

  // Duplicate the list so the CSS marquee loops seamlessly.
  const items = [...projects, ...projects];

  return (
    <section className="relative overflow-hidden bg-bg-primary py-10 lg:py-14">
      {/* Side gradient masks (fades the edges instead of hard-cutting) */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg-primary to-transparent sm:w-40" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg-primary to-transparent sm:w-40" />

      <div className="group relative">
        <div className="flex w-max animate-marquee gap-6 motion-reduce:animate-none group-hover:[animation-play-state:paused]">
          {items.map((p, idx) => {
            const title = pickLocale(p.title, locale);
            const domain = p.demoUrl
              ? p.demoUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
              : `${p.slug}.bekasen.com`;

            return (
              <a
                key={`${p.id}-${idx}`}
                href={p.demoUrl ?? `/${locale}/portfolio/${p.slug}`}
                target={p.demoUrl ? "_blank" : undefined}
                rel={p.demoUrl ? "noopener noreferrer" : undefined}
                className="group/card relative w-[420px] shrink-0 overflow-hidden rounded-2xl border border-border bg-bg-card shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_18px_50px_rgba(124,58,237,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] cursor-pointer"
              >
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 border-b border-border bg-bg-secondary px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                  <div className="ml-3 inline-flex items-center gap-1.5 truncate rounded-md bg-bg-card px-2.5 py-0.5 text-[10px] text-text-secondary">
                    <span className="h-1 w-1 rounded-full bg-emerald-500" />
                    {domain}
                  </div>
                </div>
                {/* Thumbnail */}
                <div className="aspect-[16/9] w-full overflow-hidden bg-bg-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.thumbnailUrl}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
