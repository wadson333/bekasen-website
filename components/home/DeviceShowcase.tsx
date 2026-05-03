import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolioProjects } from "@/drizzle/schema";
import DeviceShowcaseClient from "@/components/home/DeviceShowcaseClient";

type Locale = "fr" | "en" | "ht" | "es";

function pickLocale(value: { fr?: string; en?: string; ht?: string; es?: string }, locale: Locale): string {
  return value[locale] || value.en || value.fr || Object.values(value)[0] || "";
}

/**
 * DeviceShowcase — server wrapper. Fetches the most recently updated
 * featured + published project and feeds it to the client tab interface.
 *
 * Falls back to any first published project if none are featured.
 * Returns null if the portfolio table is empty.
 */
export default async function DeviceShowcase({ locale }: { locale: Locale }) {
  let [project] = await db
    .select()
    .from(portfolioProjects)
    .where(and(eq(portfolioProjects.isPublished, true), eq(portfolioProjects.isFeatured, true)))
    .orderBy(asc(portfolioProjects.displayOrder))
    .limit(1);

  if (!project) {
    [project] = await db
      .select()
      .from(portfolioProjects)
      .where(eq(portfolioProjects.isPublished, true))
      .orderBy(asc(portfolioProjects.displayOrder))
      .limit(1);
  }

  if (!project) return null;

  const slimmed = {
    slug: project.slug,
    title: pickLocale(project.title, locale),
    description: pickLocale(project.description, locale),
    thumbnailUrl: project.thumbnailUrl,
    demoUrl: project.demoUrl,
    techStack: project.techStack,
    category: project.category,
  };

  return <DeviceShowcaseClient project={slimmed} locale={locale} />;
}
