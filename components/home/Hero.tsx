"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
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
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-purple-700 dark:text-purple-300 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            {t("badge")}
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.15}
          className="mt-8 w-full px-4 text-balance font-(family-name:--font-syne) text-4xl font-bold leading-[1.1] tracking-[-0.04em] text-text-primary sm:text-5xl sm:px-0 lg:text-7xl lg:leading-[1.05]"
        >
          {t("headline")}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.3}
          className="mt-8 max-w-2xl text-pretty text-base leading-relaxed text-text-secondary sm:text-lg lg:text-xl"
        >
          {t("subtitle")}
        </motion.p>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.4}
          className="mt-4 max-w-2xl text-pretty text-sm font-medium text-purple-400 sm:text-base"
        >
          {t("tagline")}
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.5}
          className="mt-8"
        >
          <CalBookingButton
            type="discovery15"
            className="group flex h-14 items-center gap-3 rounded-full bg-purple-600 pl-6 pr-2 text-base font-medium text-white shadow-[0_8px_30px_rgba(139,92,246,0.3)] transition-all duration-300 hover:-translate-y-1 hover:bg-purple-500 hover:shadow-[0_12px_40px_rgba(139,92,246,0.4)] cursor-pointer"
          >
            <span>{t("cta")}</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight size={18} strokeWidth={2.5} />
            </span>
          </CalBookingButton>
        </motion.div>

      </div>
    </section>
  );
}
