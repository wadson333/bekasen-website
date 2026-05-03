import Script from "next/script";
import Hero from "@/components/home/Hero";
import TechMarquee from "@/components/home/TechMarquee";
import PortfolioSection from "@/components/home/PortfolioSection";
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
 * Homepage — sections ordered per the design brief:
 *   1. Hero            — value prop + primary CTA above the fold
 *   2. TechMarquee     — early social proof (tech logos = trust)
 *   3. PortfolioSection — what we build (real demos)
 *   4. ServicesGrid    — 3 clear offers with starting prices (DB-driven)
 *   5. ProcessTimeline — how it works (4 steps)
 *   6. ForWho          — target audience badges
 *   7. FAQ             — objection handling
 *   8. FinalCTA        — closing message + Cal.com booking
 *
 * Removed: ServicesBento (replaced by ServicesGrid), PricingFAQ (split into
 * FAQ — pricing CTAs now live inside ServicesGrid).
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
      <Hero />
      <TechMarquee />
      <PortfolioSection />
      <ServicesGrid locale={locale} />
      <ProcessTimeline />
      <ForWho />
      <FAQ />
      <FinalCTA />
    </main>
  );
}
