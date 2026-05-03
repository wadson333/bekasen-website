import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolioProjects } from "@/drizzle/schema";
import HeroContent from "@/components/home/HeroContent";

type Locale = "fr" | "en" | "ht" | "es";

function pickLocale(value: { fr?: string; en?: string; ht?: string; es?: string }, locale: Locale): string {
  return value[locale] || value.en || value.fr || Object.values(value)[0] || "";
}

/**
 * Hero — server wrapper. Fetches the top 3 published portfolio projects
 * and feeds them to the client `HeroContent` component which renders the
 * floating product mockup cards behind the headline.
 *
 * The previous static PNG backgrounds (hero_light.png / hero_dark.png) are
 * gone; depth now comes from a CSS gradient mesh + real product thumbnails
 * floating in 3D-tilted browser frames. Less weight, more "wow".
 */
export default async function Hero({ locale }: { locale: Locale }) {
  const projects = await db
    .select({
      slug: portfolioProjects.slug,
      title: portfolioProjects.title,
      thumbnailUrl: portfolioProjects.thumbnailUrl,
    })
    .from(portfolioProjects)
    .where(eq(portfolioProjects.isPublished, true))
    .orderBy(asc(portfolioProjects.displayOrder))
    .limit(3);

  const slimmed = projects.map((p) => ({
    slug: p.slug,
    title: pickLocale(p.title, locale),
    thumbnailUrl: p.thumbnailUrl,
  }));

  return <HeroContent projects={slimmed} />;
}
