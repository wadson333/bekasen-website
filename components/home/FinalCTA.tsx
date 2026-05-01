"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";

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
        second: "2-digit",
        hour12: true,
      });
      setTime(formatter.format(now));
    }

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="contact" className="py-32 md:py-40 bg-bg-secondary relative overflow-hidden z-0">
      {/* Background Images */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/home/cta_light.png"
          alt="Abstract Background Light"
          fill
          priority
          className="object-cover dark:hidden"
        />
        <Image
          src="/images/home/cta_dark.png"
          alt="Abstract Background Dark"
          fill
          priority
          className="object-cover hidden dark:block"
        />
        {/* Semi-transparent tint overlay to ensure text readability */}
        <div className="absolute inset-0 bg-white/70 dark:bg-black/60 pointer-events-none" />
      </div>

      {/* Gradient background orbs */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      {/* Floating SVG device mockups in arc */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        {/* Top-left — app list card */}
        <motion.svg
          className="absolute top-[8%] left-[8%] w-20 h-20"
          viewBox="0 0 80 80"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1 }}
          style={{ rotate: "-15deg" }}
        >
          <rect x="4" y="4" width="72" height="72" rx="16" fill="none" stroke="url(#cta-g1)" strokeWidth="1.5" />
          <rect x="14" y="14" width="52" height="6" rx="3" fill="#a855f7" fillOpacity="0.5" />
          <rect x="14" y="26" width="36" height="4" rx="2" fill="#ffffff" fillOpacity="0.25" />
          <rect x="14" y="36" width="52" height="28" rx="6" fill="#a855f7" fillOpacity="0.25" />
          <defs><linearGradient id="cta-g1" x1="0" y1="0" x2="80" y2="80"><stop stopColor="#a855f7" stopOpacity="0.8" /><stop offset="1" stopColor="#6366f1" stopOpacity="0.4" /></linearGradient></defs>
        </motion.svg>

        {/* Top — profile card */}
        <motion.svg
          className="absolute top-[4%] left-[28%] w-24 h-24"
          viewBox="0 0 96 96"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 0.85, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{ rotate: "-5deg" }}
        >
          <rect x="4" y="4" width="88" height="88" rx="18" fill="#ffffff" fillOpacity="0.06" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />
          <circle cx="48" cy="38" r="14" fill="#a855f7" fillOpacity="0.35" />
          <rect x="24" y="60" width="48" height="4" rx="2" fill="#ffffff" fillOpacity="0.25" />
          <rect x="30" y="70" width="36" height="4" rx="2" fill="#ffffff" fillOpacity="0.15" />
        </motion.svg>

        {/* Top-center-right — media card */}
        <motion.svg
          className="absolute top-[5%] right-[25%] w-20 h-20"
          viewBox="0 0 80 80"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 0.8, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{ rotate: "8deg" }}
        >
          <rect x="4" y="4" width="72" height="72" rx="16" fill="#ffffff" fillOpacity="0.06" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />
          <rect x="12" y="12" width="56" height="32" rx="6" fill="#6366f1" fillOpacity="0.3" />
          <rect x="12" y="50" width="28" height="4" rx="2" fill="#ffffff" fillOpacity="0.25" />
          <rect x="12" y="60" width="40" height="4" rx="2" fill="#ffffff" fillOpacity="0.15" />
        </motion.svg>

        {/* Top-right — dashboard card */}
        <motion.svg
          className="absolute top-[10%] right-[6%] w-[88px] h-[88px]"
          viewBox="0 0 88 88"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 0.9, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          style={{ rotate: "18deg" }}
        >
          <rect x="4" y="4" width="80" height="80" rx="18" fill="none" stroke="url(#cta-g2)" strokeWidth="1.5" />
          <rect x="14" y="14" width="60" height="36" rx="8" fill="#a855f7" fillOpacity="0.25" />
          <circle cx="28" cy="64" r="6" fill="#6366f1" fillOpacity="0.35" />
          <rect x="40" y="58" width="28" height="4" rx="2" fill="#ffffff" fillOpacity="0.25" />
          <rect x="40" y="66" width="20" height="4" rx="2" fill="#ffffff" fillOpacity="0.15" />
          <defs><linearGradient id="cta-g2" x1="0" y1="0" x2="88" y2="88"><stop stopColor="#6366f1" stopOpacity="0.7" /><stop offset="1" stopColor="#a855f7" stopOpacity="0.35" /></linearGradient></defs>
        </motion.svg>

        {/* Mid-left — data rows card */}
        <motion.svg
          className="absolute top-[40%] left-[3%] w-24 h-24"
          viewBox="0 0 96 96"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 0.8, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{ rotate: "-20deg" }}
        >
          <rect x="4" y="4" width="88" height="88" rx="18" fill="#ffffff" fillOpacity="0.06" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />
          <rect x="14" y="14" width="68" height="8" rx="4" fill="#a855f7" fillOpacity="0.35" />
          <rect x="14" y="28" width="68" height="8" rx="4" fill="#ffffff" fillOpacity="0.15" />
          <rect x="14" y="42" width="68" height="8" rx="4" fill="#ffffff" fillOpacity="0.15" />
          <rect x="14" y="56" width="68" height="8" rx="4" fill="#a855f7" fillOpacity="0.25" />
          <rect x="14" y="70" width="40" height="8" rx="4" fill="#ffffff" fillOpacity="0.15" />
        </motion.svg>

        {/* Mid-right — grid card */}
        <motion.svg
          className="absolute top-[42%] right-[2%] w-20 h-20"
          viewBox="0 0 80 80"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 0.85, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.35 }}
          style={{ rotate: "22deg" }}
        >
          <rect x="4" y="4" width="72" height="72" rx="16" fill="none" stroke="url(#cta-g3)" strokeWidth="1.5" />
          <rect x="14" y="14" width="24" height="24" rx="6" fill="#a855f7" fillOpacity="0.35" />
          <rect x="42" y="14" width="24" height="24" rx="6" fill="#6366f1" fillOpacity="0.3" />
          <rect x="14" y="42" width="24" height="24" rx="6" fill="#6366f1" fillOpacity="0.3" />
          <rect x="42" y="42" width="24" height="24" rx="6" fill="#a855f7" fillOpacity="0.35" />
          <defs><linearGradient id="cta-g3" x1="0" y1="80" x2="80" y2="0"><stop stopColor="#a855f7" stopOpacity="0.6" /><stop offset="1" stopColor="#4338ca" stopOpacity="0.35" /></linearGradient></defs>
        </motion.svg>

        {/* Bottom-left — avatar card */}
        <motion.svg
          className="absolute bottom-[10%] left-[10%] w-20 h-20"
          viewBox="0 0 80 80"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 0.8, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          style={{ rotate: "-25deg" }}
        >
          <rect x="4" y="4" width="72" height="72" rx="16" fill="#ffffff" fillOpacity="0.06" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />
          <circle cx="40" cy="32" r="12" fill="#6366f1" fillOpacity="0.35" />
          <rect x="16" y="52" width="48" height="4" rx="2" fill="#ffffff" fillOpacity="0.25" />
          <rect x="22" y="62" width="36" height="4" rx="2" fill="#ffffff" fillOpacity="0.15" />
        </motion.svg>

        {/* Bottom-right — chart card */}
        <motion.svg
          className="absolute bottom-[8%] right-[8%] w-24 h-24"
          viewBox="0 0 96 96"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 0.85, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.55 }}
          style={{ rotate: "15deg" }}
        >
          <rect x="4" y="4" width="88" height="88" rx="18" fill="none" stroke="url(#cta-g4)" strokeWidth="1.5" />
          <rect x="14" y="14" width="68" height="40" rx="8" fill="#a855f7" fillOpacity="0.25" />
          <rect x="14" y="62" width="32" height="6" rx="3" fill="#ffffff" fillOpacity="0.25" />
          <rect x="14" y="74" width="48" height="4" rx="2" fill="#ffffff" fillOpacity="0.15" />
          <defs><linearGradient id="cta-g4" x1="96" y1="0" x2="0" y2="96"><stop stopColor="#a855f7" stopOpacity="0.6" /><stop offset="1" stopColor="#6366f1" stopOpacity="0.3" /></linearGradient></defs>
        </motion.svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest text-purple-400 bg-purple-400/10 rounded-full mb-6">
            {t("badge")}
          </span>

          {/* Heading */}
          <h2 className="text-3xl md:text-5xl font-bold font-[family-name:var(--font-syne)] text-text-primary max-w-3xl mx-auto leading-tight">
            {t("title")}
          </h2>

          {/* Subtitle */}
          <p className="mt-6 text-text-secondary text-lg max-w-xl mx-auto">
            {t("subtitle")}
          </p>

          {/* CTA Button */}
          <motion.div
            className="mt-10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/start-project"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
            >
              {t("cta")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Live Clock */}
          <motion.div
            className="mt-12 inline-flex items-center gap-2 text-text-secondary text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Clock className="w-4 h-4 text-purple-400" />
            <span>{t("clockLabel")}</span>
            <span className="font-mono text-text-primary tabular-nums">
              {time || "--:--:-- --"}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
