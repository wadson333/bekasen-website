"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
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

type Project = {
  slug: string;
  title: string;
  thumbnailUrl: string;
};

/**
 * Client part of the Hero — receives the top 3 portfolio thumbnails from the
 * server wrapper to render the floating product mockups behind the headline.
 *
 * No background image dependency anymore: the visual depth comes from a CSS
 * gradient mesh + 3 perspective-tilted thumbnail cards that gently float on
 * a slow loop. Reduced-motion safe.
 */
export default function HeroContent({ projects }: { projects: Project[] }) {
  const t = useTranslations("hero");
  const locale = useLocale();
  const reduced = useReducedMotion();

  const safeFadeUp = reduced
    ? { hidden: { opacity: 1, y: 0 }, visible: () => ({ opacity: 1, y: 0, transition: { duration: 0 } }) }
    : fadeUp;

  // Pad to 3 slots; if no projects exist, render gradient placeholders so the
  // composition stays balanced.
  const slots: (Project | null)[] = [
    projects[0] ?? null,
    projects[1] ?? null,
    projects[2] ?? null,
  ];

  return (
    <section
      className="relative flex min-h-[92vh] items-center justify-center overflow-clip px-6 pt-28 pb-32"
      style={{ clipPath: "inset(0 0 -200px 0)" }}
    >
      {/* ─── Background — CSS gradient mesh + grain (no PNG dependencies) ─── */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        {/* Light mode: soft purple/indigo glow on neutral background */}
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(168,85,247,0.18), transparent 60%), radial-gradient(ellipse 70% 50% at 80% 30%, rgba(99,102,241,0.16), transparent 60%), radial-gradient(ellipse 60% 70% at 50% 90%, rgba(139,92,246,0.10), transparent 60%)",
          }}
        />
        {/* Dark mode: stronger contrast */}
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(168,85,247,0.30), transparent 60%), radial-gradient(ellipse 70% 50% at 80% 30%, rgba(79,70,229,0.28), transparent 60%), radial-gradient(ellipse 60% 70% at 50% 90%, rgba(139,92,246,0.18), transparent 60%)",
          }}
        />
        {/* Grid pattern overlay (very subtle) */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            color: "currentColor",
          }}
        />
        {/* Bottom fade into the next section */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <motion.div variants={safeFadeUp} initial="hidden" animate="visible" custom={0}>
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-purple-700 backdrop-blur-xl dark:text-purple-300">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            {t("badge")}
          </span>
        </motion.div>

        <motion.h1
          variants={safeFadeUp}
          initial="hidden"
          animate="visible"
          custom={0.15}
          className="mt-8 w-full text-balance px-4 font-(family-name:--font-syne) text-4xl font-bold leading-[1.1] tracking-[-0.04em] text-text-primary sm:px-0 sm:text-5xl lg:text-7xl lg:leading-[1.05]"
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
          <CalBookingButton
            type="discovery15"
            className="group flex h-14 items-center gap-3 rounded-full bg-purple-600 pl-6 pr-2 text-base font-medium text-white shadow-[0_8px_30px_rgba(139,92,246,0.3)] transition-all duration-300 hover:-translate-y-1 hover:bg-purple-500 hover:shadow-[0_12px_40px_rgba(139,92,246,0.4)] cursor-pointer"
          >
            <span>{t("cta")}</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              <ArrowUpRight size={18} strokeWidth={2.5} />
            </span>
          </CalBookingButton>

          <Link
            href={`/${locale}/portfolio`}
            className="inline-flex h-14 items-center gap-2 rounded-full border border-border bg-bg-card/60 px-6 text-base font-medium text-text-primary backdrop-blur-sm transition-colors hover:border-purple-400 hover:text-purple-400 cursor-pointer"
          >
            {t("ctaSecondary")}
            <ArrowUpRight size={18} strokeWidth={2} />
          </Link>
        </motion.div>

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

        {/* ─── Floating product mockups (real portfolio thumbnails) ─── */}
        <div
          className="pointer-events-none relative mt-20 hidden h-[280px] w-full max-w-5xl md:block"
          aria-hidden="true"
        >
          {slots.map((project, idx) => {
            const config = [
              { left: "0%",    rotate: -8, y: 20, delay: 0.7 },
              { left: "33%",   rotate:  4, y:  0, delay: 0.85, scale: 1.05 },
              { left: "66%",   rotate:  10, y: 30, delay: 1.0 },
            ][idx];
            if (!config) return null;

            return (
              <motion.div
                key={idx}
                className="absolute top-0 w-[33%] origin-bottom"
                style={{ left: config.left }}
                initial={reduced ? false : { opacity: 0, y: 60, rotate: config.rotate * 0.3 }}
                animate={
                  reduced
                    ? { opacity: 1, y: 0 }
                    : {
                        opacity: 1,
                        y: [config.y, config.y - 10, config.y],
                        rotate: config.rotate,
                      }
                }
                transition={
                  reduced
                    ? { duration: 0 }
                    : {
                        opacity: { duration: 0.7, delay: config.delay },
                        y: { duration: 6 + idx, repeat: Infinity, ease: "easeInOut", delay: config.delay },
                        rotate: { duration: 0.7, delay: config.delay },
                      }
                }
              >
                <div
                  className="overflow-hidden rounded-2xl border border-border bg-bg-card shadow-[0_24px_60px_rgba(15,23,42,0.18)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
                  style={{ transform: `scale(${config.scale ?? 1})` }}
                >
                  <div className="flex items-center gap-1.5 border-b border-border bg-bg-secondary px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-red-400/70" />
                    <span className="h-2 w-2 rounded-full bg-amber-400/70" />
                    <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
                  </div>
                  <div className="aspect-video w-full bg-bg-card">
                    {project ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="h-full w-full object-cover"
                        loading="eager"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-purple-500/20 via-indigo-500/15 to-purple-500/10" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
