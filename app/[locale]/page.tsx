import Script from "next/script";
import Hero from "@/components/home/Hero";
import MockupMarquee from "@/components/home/MockupMarquee";
import StatsStrip from "@/components/home/StatsStrip";
import TechMarquee from "@/components/home/TechMarquee";
import BentoBenefits from "@/components/home/BentoBenefits";
import DarkShowcase from "@/components/home/DarkShowcase";
import ServicesGrid from "@/components/home/ServicesGrid";
import ProcessTimeline from "@/components/home/ProcessTimeline";
import ForWho from "@/components/home/ForWho";
import FAQ from "@/components/home/FAQ";
import FinalCTA from "@/components/home/FinalCTA";
import { CONTACT, SITE } from "@/lib/contact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Locale = "fr" | "en" | "ht" | "es";

/**
 * Homepage — premium agency landing.
 *
 * Visual rhythm (light → dark → light → vibrant → light → dark → light):
 *   1. Hero            — light, sober, headline + CTAs + live availability
 *   2. MockupMarquee   — light, infinite scroll WITH Desktop/Tablet/Mobile
 *                        tab switcher that re-frames every project
 *   3. StatsStrip      — light, 4 animated counters
 *   4. TechMarquee     — light, small logo strip (social proof)
 *   5. BentoBenefits   — VIBRANT purple gradient, 4 asymmetric white cards
 *   6. DarkShowcase    — DARK band, big product mockup + "Our promise"
 *   7. ServicesGrid    — light, 3 service cards with starting prices
 *   8. ProcessTimeline — light, 4-step process
 *   9. ForWho          — light, 6 sector badges + "Your sector?" CTA
 *  10. FAQ             — light, accordion with category pills
 *  11. FinalCTA        — light, closing message + faux Cal slots picker
 *
 * Removed from a previous iteration: floating mockup cards inside the hero
 * (now in MockupMarquee), DeviceShowcase tab section (redundant — depth
 * comes from MockupMarquee + DarkShowcase), PortfolioPreview grid (the
 * marquee + showcase already establish credibility; full grid lives at
 * /portfolio).
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/logo.png`,
    founder: {
      "@type": "Person",
      name: SITE.founder,
    },
    sameAs: [CONTACT.linkedin],
  };

  return (
    <main className="overflow-x-clip">
      <Script
        id="org-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <Hero locale={locale} />
      <MockupMarquee locale={locale} />
      <StatsStrip locale={locale} />
      <TechMarquee />
      <BentoBenefits />
      <DarkShowcase locale={locale} />
      <ServicesGrid locale={locale} />
      <ProcessTimeline />
      <ForWho />
      <FAQ />
      <FinalCTA />
    </main>
  );
}
