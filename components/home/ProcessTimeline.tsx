"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { Search, Code, Rocket, TrendingUp, type LucideIcon } from "lucide-react";

type Step = {
  key: "step1" | "step2" | "step3" | "step4";
  number: string;
  Icon: LucideIcon;
};

const STEPS: Step[] = [
  { key: "step1", number: "01", Icon: Search },
  { key: "step2", number: "02", Icon: Code },
  { key: "step3", number: "03", Icon: Rocket },
  { key: "step4", number: "04", Icon: TrendingUp },
];

/**
 * "How it works" — minimal 4-step process per the design brief.
 *
 * Replaces the previous 255-line version which had 4 hand-drawn SVG
 * illustrations, gradient text, multi-color glows, ping animations,
 * and an alternating left/right zig-zag layout. Cleaner, scan-friendly,
 * mobile-first.
 *
 * Layout: 4 cards in a row on desktop with a thin connector line between
 * them; stacked vertically on mobile with a left-side rail.
 */
export default function ProcessTimeline() {
  const t = useTranslations("processTimeline");
  const reduced = useReducedMotion();

  return (
    <section id="process" className="bg-bg-primary py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <header className="mx-auto mb-16 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-400">
            {t("badge")}
          </span>
          <h2 className="mt-6 font-(family-name:--font-syne) text-3xl font-bold text-text-primary md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-text-secondary">{t("subtitle")}</p>
        </header>

        {/* Desktop: 4 columns + thin connector line */}
        <div className="relative hidden md:block">
          {/* Connector line behind the cards */}
          <div className="absolute left-[12%] right-[12%] top-10 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" aria-hidden="true" />

          <ol className="relative grid grid-cols-4 gap-6">
            {STEPS.map((step, idx) => {
              const Icon = step.Icon;
              return (
                <motion.li
                  key={step.key}
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-bg-card text-purple-400 transition-colors hover:border-purple-400 hover:text-purple-300">
                    <Icon className="h-7 w-7" strokeWidth={1.75} />
                  </div>
                  <span className="mt-4 font-(family-name:--font-syne) text-xs font-semibold uppercase tracking-wider text-purple-400">
                    {step.number}
                  </span>
                  <h3 className="mt-2 font-(family-name:--font-syne) text-lg font-bold text-text-primary">
                    {t(`${step.key}Title`)}
                  </h3>
                  <p className="mt-2 max-w-[14rem] text-sm leading-relaxed text-text-secondary">
                    {t(`${step.key}Description`)}
                  </p>
                </motion.li>
              );
            })}
          </ol>
        </div>

        {/* Mobile: vertical stack with left rail */}
        <ol className="relative md:hidden">
          <div className="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple-500/30 to-transparent" aria-hidden="true" />
          <div className="space-y-10">
            {STEPS.map((step, idx) => {
              const Icon = step.Icon;
              return (
                <motion.li
                  key={step.key}
                  initial={reduced ? false : { opacity: 0, x: -16 }}
                  whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="relative flex items-start gap-5 pl-2"
                >
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-border bg-bg-card text-purple-400">
                    <Icon className="h-7 w-7" strokeWidth={1.75} />
                  </div>
                  <div className="pt-1">
                    <span className="font-(family-name:--font-syne) text-xs font-semibold uppercase tracking-wider text-purple-400">
                      {step.number}
                    </span>
                    <h3 className="mt-1 font-(family-name:--font-syne) text-lg font-bold text-text-primary">
                      {t(`${step.key}Title`)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {t(`${step.key}Description`)}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </div>
        </ol>
      </div>
    </section>
  );
}
