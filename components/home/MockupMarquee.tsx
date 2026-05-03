import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolioProjects } from "@/drizzle/schema";
import MockupMarqueeClient from "@/components/home/MockupMarqueeClient";

type Locale = "fr" | "en" | "ht" | "es";

function pickLocale(value: { fr?: string; en?: string; ht?: string; es?: string }, locale: Locale): string {
  return value[locale] || value.en || value.fr || Object.values(value)[0] || "";
}

/**
 * MockupMarquee — server wrapper. Fetches every published portfolio project
 * and delegates rendering to the client component, which handles the
 * Desktop/Tablet/Mobile tab switcher + the auto-scrolling marquee.
 */
export default async function MockupMarquee({ locale }: { locale: Locale }) {
  const projects = await db
    .select()
    .from(portfolioProjects)
    .where(eq(portfolioProjects.isPublished, true))
    .orderBy(asc(portfolioProjects.displayOrder));

  if (projects.length === 0) return null;

  const slimmed = projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: pickLocale(p.title, locale),
    thumbnailUrl: p.thumbnailUrl,
    demoUrl: p.demoUrl,
  }));

  return <MockupMarqueeClient projects={slimmed} locale={locale} />;
}
