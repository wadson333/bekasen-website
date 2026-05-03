import Script from "next/script";
import Hero from "@/components/home/Hero";
import ForWho from "@/components/home/ForWho";
import TechMarquee from "@/components/home/TechMarquee";
import PortfolioSection from "@/components/home/PortfolioSection";
import ServicesBento from "@/components/home/ServicesBento";
import ProcessTimeline from "@/components/home/ProcessTimeline";
import TrustedBy from "@/components/home/TrustedBy";
import PricingFAQ from "@/components/home/PricingFAQ";
import FinalCTA from "@/components/home/FinalCTA";
import { CONTACT, SITE } from "@/lib/contact";

export default function HomePage() {
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
      <ForWho />
      <TechMarquee />
      <PortfolioSection />
      <ServicesBento />
      <ProcessTimeline />
      <TrustedBy />
      <PricingFAQ />
      <FinalCTA />
    </main>
  );
}
