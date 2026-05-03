"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import CalBookingButton from "@/components/CalBookingButton";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

/**
 * Hero V3 — sober premium agency landing.
 *
 * Layout (Pacivra-inspired but on brand purple):
 *   - Live availability pill at top ("4 spots available")
 *   - Tight headline with ONE word in purple gradient (locale-aware)
 *   - Short subtitle (max 2 lines)
 *   - 2 CTAs side by side: primary purple pill + ghost outline
 *   - Tiny trust line below
 *
 * Background: ONE subtle purple radial + grain pattern. No floating
 * mockups (those moved to the dedicated MockupMarquee section).
 */
export default function HeroContent() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const reduced = useReducedMotion();

  // The headline has its key word swapped for a gradient-text version.
  const HIGHLIGHT: Record<string, string> = {
    fr: "haïtiennes",
    en: "Haitian",
    ht: "ayisyen",
    es: "haitianas",
  };
  const headline = t("headline");
  const highlight = HIGHLIGHT[locale] ?? "";
  const headlineParts = highlight && headline.includes(highlight)
    ? headline.split(highlight)
    : [headline];

  const safeFadeUp = reduced
    ? { hidden: { opacity: 1, y: 0 }, visible: () => ({ opacity: 1, y: 0, transition: { duration: 0 } }) }
    : fadeUp;

  return (
    <section className="relative overflow-hidden bg-bg-primary px-6 pt-32 pb-20 lg:pt-40 lg:pb-28">
      {/* Background: single subtle purple radial */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute left-1/2 top-0 h-[640px] w-[1100px] -translate-x-1/2 -translate-y-1/4"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(124,58,237,0.12), transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            color: "currentColor",
          }}
        />
      </div>

      <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
        <motion.div variants={safeFadeUp} initial="hidden" animate="visible" custom={0}>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-700 backdrop-blur-xl dark:text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>
              {locale === "fr"
                ? "4 places disponibles ce trimestre"
                : locale === "ht"
                  ? "4 plas disponib trimès sa"
                  : locale === "es"
                    ? "4 cupos disponibles este trimestre"
                    : "4 spots available this quarter"}
            </span>
          </div>
        </motion.div>

        <motion.h1
          variants={safeFadeUp}
          initial="hidden"
          animate="visible"
          custom={0.1}
          className="mt-8 text-balance font-(family-name:--font-syne) text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-text-primary sm:text-5xl lg:text-7xl"
        >
          {headlineParts[0]}
          {headlineParts.length > 1 ? (
            <>
              <span className="bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
                {highlight}
              </span>
              {headlineParts[1]}
            </>
          ) : null}
        </motion.h1>

        <motion.p
          variants={safeFadeUp}
          initial="hidden"
          animate="visible"
          custom={0.2}
          className="mt-7 max-w-2xl text-pretty text-base leading-relaxed text-text-secondary sm:text-lg lg:text-xl"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          variants={safeFadeUp}
          initial="hidden"
          animate="visible"
          custom={0.3}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-3"
        >
          <CalBookingButton
            type="discovery15"
            className="group inline-flex h-14 items-center gap-3 rounded-full bg-purple-600 pl-7 pr-3 text-base font-medium text-white shadow-[0_8px_30px_rgba(124,58,237,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-[0_12px_40px_rgba(124,58,237,0.4)] cursor-pointer"
          >
            <span>{t("cta")}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              <ArrowUpRight size={16} strokeWidth={2.5} />
            </span>
          </CalBookingButton>

          <Link
            href={`/${locale}/portfolio`}
            className="inline-flex h-14 items-center gap-2 rounded-full border border-border bg-bg-card/50 px-6 text-base font-medium text-text-primary backdrop-blur-sm transition-colors hover:border-purple-400 hover:text-purple-400 cursor-pointer"
          >
            {t("ctaSecondary")}
          </Link>
        </motion.div>

        <motion.p
          variants={safeFadeUp}
          initial="hidden"
          animate="visible"
          custom={0.4}
          className="mt-8 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-text-secondary"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          {locale === "fr"
            ? "Code source à vous · Hébergement inclus 30 jours · Réponse en moins de 24h"
            : locale === "ht"
              ? "Kòd sous a se pou ou · Ebèjman ladan 30 jou · Repons mwens pase 24h"
              : locale === "es"
                ? "Código tuyo · Hosting incluido 30 días · Respuesta en menos de 24h"
                : "Source code is yours · Hosting included 30 days · Reply within 24h"}
        </motion.p>
      </div>
    </section>
  );
}
