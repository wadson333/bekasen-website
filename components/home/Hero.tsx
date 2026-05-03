import HeroContent from "@/components/home/HeroContent";

type Locale = "fr" | "en" | "ht" | "es";

/**
 * Hero — server wrapper. The previous version fetched portfolio thumbnails
 * for floating mockup cards inside the hero; that visual was scrapped (too
 * busy). The hero is now text-only: badge + headline + subtitle + CTAs +
 * trust line. Real product mockups live right below in `<MockupMarquee>`.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function Hero({ locale: _locale }: { locale: Locale }) {
  return <HeroContent />;
}
