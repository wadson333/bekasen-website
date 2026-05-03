"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import CalBookingButton from "@/components/CalBookingButton";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

export default function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const reduced = useReducedMotion();

  // When user prefers reduced motion, skip the entrance animation entirely
  // (Framer Motion still renders, just without the y-offset / fade-in).
  const safeFadeUp = reduced
    ? { hidden: { opacity: 1, y: 0 }, visible: () => ({ opacity: 1, y: 0, transition: { duration: 0 } }) }
    : fadeUp;

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center px-6 pt-24 overflow-clip" style={{ clipPath: 'inset(0 0 -200px 0)' }}>
      <div className="absolute inset-0 pointer-events-none -z-10" aria-hidden="true">
        <Image 
          src="/images/home/hero_light.png" 
          alt="Light Theme Background" 
          fill 
          priority 
          sizes="100vw"
          className="object-cover object-center opacity-80 dark:hidden" 
        />
        <Image 
          src="/images/home/hero_dark.png" 
          alt="Dark Theme Background" 
          fill 
          priority 
          sizes="100vw"
          className="hidden object-cover object-center opacity-80 dark:block" 
        />
        
        {/* Very subtle transition at the bottom edge to blend into the rest of the page */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/50 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <motion.div variants={safeFadeUp} initial="hidden" animate="visible" custom={0}>
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-purple-700 dark:text-purple-300 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            {t("badge")}
          </span>
        </motion.div>

        <motion.h1
          variants={safeFadeUp}
          initial="hidden"
          animate="visible"
          custom={0.15}
          className="mt-8 w-full px-4 text-balance font-(family-name:--font-syne) text-4xl font-bold leading-[1.1] tracking-[-0.04em] text-text-primary sm:text-5xl sm:px-0 lg:text-7xl lg:leading-[1.05]"
        >
          {t("headline")}
        </motion.h1>

        <motion.p
          variants={safeFadeUp}
          initial="hidden"
          animate="visible"
          custom={0.3}
          className="mt-8 max-w-2xl text-pretty text-base leading-relaxed text-text-secondary sm:text-lg lg:text-xl"
        >
          {t("subtitle")}
        </motion.p>

        <motion.p
          variants={safeFadeUp}
          initial="hidden"
          animate="visible"
          custom={0.4}
          className="mt-4 max-w-2xl text-pretty text-sm font-medium text-purple-400 sm:text-base"
        >
          {t("tagline")}
        </motion.p>

        <motion.div
          variants={safeFadeUp}
          initial="hidden"
          animate="visible"
          custom={0.5}
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-5"
        >
          {/* Primary CTA — books a 15-min discovery call via Cal popup */}
          <CalBookingButton
            type="discovery15"
            className="group flex h-14 items-center gap-3 rounded-full bg-purple-600 pl-6 pr-2 text-base font-medium text-white shadow-[0_8px_30px_rgba(139,92,246,0.3)] transition-all duration-300 hover:-translate-y-1 hover:bg-purple-500 hover:shadow-[0_12px_40px_rgba(139,92,246,0.4)] cursor-pointer"
          >
            <span>{t("cta")}</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight size={18} strokeWidth={2.5} />
            </span>
          </CalBookingButton>

          {/* Secondary CTA — sends to public portfolio */}
          <Link
            href={`/${locale}/portfolio`}
            className="inline-flex h-14 items-center gap-2 rounded-full border border-border bg-bg-card/60 px-6 text-base font-medium text-text-primary backdrop-blur-sm transition-colors hover:border-purple-400 hover:text-purple-400 cursor-pointer"
          >
            {t("ctaSecondary")}
            <ArrowUpRight size={18} strokeWidth={2} />
          </Link>
        </motion.div>

        {/* Trust stripe — 3 lightweight signals to build credibility within 3s */}
        <motion.ul
          variants={safeFadeUp}
          initial="hidden"
          animate="visible"
          custom={0.65}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-text-secondary"
        >
          <li className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t("trust.uptime")}
          </li>
          <li className="hidden h-4 w-px bg-border sm:inline-block" aria-hidden="true" />
          <li>{t("trust.gdpr")}</li>
          <li className="hidden h-4 w-px bg-border sm:inline-block" aria-hidden="true" />
          <li>{t("trust.ownership")}</li>
        </motion.ul>

      </div>
    </section>
  );
}
