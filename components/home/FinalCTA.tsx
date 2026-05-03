"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import CalBookingButton from "@/components/CalBookingButton";

/**
 * Final closing CTA — clean & focused per the design brief:
 *   - One single message
 *   - One single primary action (Cal popup)
 *   - Live clock (NY) for trust ("we reply within hours")
 *
 * Removed from the previous version:
 *   - 6 floating decorative SVG mockups (visual clutter)
 *   - 2 background image layers + tint overlay (loaded ~600KB)
 *   - 2 blurred gradient orbs
 *   - Gradient CTA background (replaced with solid purple — matches brand,
 *     stays cohesive with the rest of the buttons)
 */
export default function FinalCTA() {
  const t = useTranslations("finalCTA");
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setTime(formatter.format(now));
    }

    updateClock();
    const interval = setInterval(updateClock, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-bg-secondary py-24 md:py-32"
    >
      {/* Single subtle radial accent (kept — adds depth without clutter) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/8 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-400"
        >
          {t("badge")}
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-6 font-(family-name:--font-syne) text-3xl font-bold leading-tight text-text-primary md:text-5xl"
        >
          {t("title")}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-5 max-w-xl text-lg text-text-secondary"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-10"
        >
          <CalBookingButton
            type="discovery15"
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:bg-purple-500 hover:shadow-purple-500/40 cursor-pointer"
          >
            {t("cta")}
            <ArrowRight className="h-5 w-5" />
          </CalBookingButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10 inline-flex items-center gap-2 text-sm text-text-secondary"
        >
          <Clock className="h-4 w-4 text-purple-400" />
          <span>{t("clockLabel")}</span>
          <span className="font-mono tabular-nums text-text-primary">
            {time || "--:--"}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
