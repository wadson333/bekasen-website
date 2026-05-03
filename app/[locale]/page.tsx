import Script from "next/script";
import Hero from "@/components/home/Hero";
import MockupMarquee from "@/components/home/MockupMarquee";
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
 *   2. MockupMarquee   — light, infinite scroll of real portfolio thumbnails
 *   3. TechMarquee     — light, small logo strip (social proof)
 *   4. BentoBenefits   — VIBRANT purple gradient, 4 asymmetric white cards
 *   5. DarkShowcase    — DARK band, big product mockup + "How we work"
 *   6. ServicesGrid    — light, 3 service cards with starting prices
 *   7. ProcessTimeline — light, 4-step process
 *   8. ForWho          — light, 4 sector badges
 *   9. FAQ             — light, accordion
 *  10. FinalCTA        — light, closing message + Cal popup
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
