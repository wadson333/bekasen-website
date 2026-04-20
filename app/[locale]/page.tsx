import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import TechMarquee from "@/components/home/TechMarquee";
import PortfolioSection from "@/components/home/PortfolioSection";
import ServicesBento from "@/components/home/ServicesBento";
import ProcessTimeline from "@/components/home/ProcessTimeline";
import Testimonials from "@/components/home/Testimonials";
import PricingFAQ from "@/components/home/PricingFAQ";
import FinalCTA from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <main className="overflow-x-clip">
      <Navbar />
      <Hero />
      <TechMarquee />
      <PortfolioSection />
      <ServicesBento />
      <ProcessTimeline />
      <Testimonials />
      <PricingFAQ />
      <FinalCTA />
    </main>
  );
}
