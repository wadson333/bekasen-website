"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Search, Code, Rocket, TrendingUp } from "lucide-react";

/* Mini SVG illustrations for each step */
function IllustrationDiscovery() {
  return (
    <svg viewBox="0 0 120 100" fill="none" className="w-full h-auto max-w-[120px]">
      <rect x="15" y="20" width="55" height="65" rx="4" stroke="currentColor" strokeWidth="1.5" className="text-purple-400/40" />
      <line x1="25" y1="36" x2="55" y2="36" stroke="currentColor" strokeWidth="1.5" className="text-purple-400/30" />
      <line x1="25" y1="46" x2="50" y2="46" stroke="currentColor" strokeWidth="1.5" className="text-purple-400/30" />
      <line x1="25" y1="56" x2="58" y2="56" stroke="currentColor" strokeWidth="1.5" className="text-purple-400/30" />
      <line x1="25" y1="66" x2="45" y2="66" stroke="currentColor" strokeWidth="1.5" className="text-purple-400/30" />
      <circle cx="82" cy="48" r="20" stroke="currentColor" strokeWidth="2" className="text-purple-400/60" />
      <line x1="96" y1="62" x2="110" y2="76" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-purple-400/60" />
      <circle cx="82" cy="48" r="8" fill="currentColor" className="text-purple-400/10" />
    </svg>
  );
}

function IllustrationDevelopment() {
  return (
    <svg viewBox="0 0 120 100" fill="none" className="w-full h-auto max-w-[120px]">
      <rect x="10" y="15" width="100" height="65" rx="6" stroke="currentColor" strokeWidth="1.5" className="text-violet-400/40" />
      <rect x="10" y="15" width="100" height="14" rx="6" fill="currentColor" className="text-violet-400/10" />
      <circle cx="22" cy="22" r="3" fill="currentColor" className="text-red-400/40" />
      <circle cx="32" cy="22" r="3" fill="currentColor" className="text-yellow-400/40" />
      <circle cx="42" cy="22" r="3" fill="currentColor" className="text-green-400/40" />
      <text x="22" y="45" fontSize="9" fontFamily="monospace" fill="currentColor" className="text-violet-400/50">{"<div>"}</text>
      <text x="30" y="56" fontSize="9" fontFamily="monospace" fill="currentColor" className="text-purple-400/40">{"<h1/>"}</text>
      <text x="22" y="67" fontSize="9" fontFamily="monospace" fill="currentColor" className="text-violet-400/50">{"</div>"}</text>
    </svg>
  );
}

function IllustrationLaunch() {
  return (
    <svg viewBox="0 0 120 100" fill="none" className="w-full h-auto max-w-[120px]">
      <path d="M60 10 C60 10 80 30 80 55 C80 70 70 80 60 85 C50 80 40 70 40 55 C40 30 60 10 60 10Z" stroke="currentColor" strokeWidth="1.5" className="text-indigo-400/50" fill="currentColor" fillOpacity="0.05" />
      <circle cx="60" cy="48" r="8" stroke="currentColor" strokeWidth="1.5" className="text-indigo-400/60" />
      <circle cx="60" cy="48" r="3" fill="currentColor" className="text-indigo-400/40" />
      <path d="M44 68 L36 85 L52 75Z" fill="currentColor" className="text-purple-400/20" />
      <path d="M76 68 L84 85 L68 75Z" fill="currentColor" className="text-purple-400/20" />
      <path d="M55 85 L60 95 L65 85" fill="currentColor" className="text-orange-400/30" />
      <path d="M57 85 L60 92 L63 85" fill="currentColor" className="text-yellow-400/30" />
    </svg>
  );
}

function IllustrationGrowth() {
  return (
    <svg viewBox="0 0 120 100" fill="none" className="w-full h-auto max-w-[120px]">
      <line x1="15" y1="85" x2="110" y2="85" stroke="currentColor" strokeWidth="1.5" className="text-purple-400/30" />
      <line x1="15" y1="85" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" className="text-purple-400/30" />
      <path d="M20 75 Q40 70 50 55 Q60 40 75 35 Q90 30 105 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-fuchsia-400/60" fill="none" />
      <path d="M20 75 Q40 70 50 55 Q60 40 75 35 Q90 30 105 15 V85 H20Z" fill="currentColor" className="text-fuchsia-400/[0.07]" />
      <circle cx="50" cy="55" r="4" fill="currentColor" className="text-purple-400/50" />
      <circle cx="75" cy="35" r="4" fill="currentColor" className="text-purple-400/50" />
      <circle cx="105" cy="15" r="5" fill="currentColor" className="text-fuchsia-400/60" />
      <rect x="28" y="65" width="8" height="20" rx="2" fill="currentColor" className="text-purple-400/15" />
      <rect x="45" y="55" width="8" height="30" rx="2" fill="currentColor" className="text-purple-400/15" />
      <rect x="62" y="45" width="8" height="40" rx="2" fill="currentColor" className="text-purple-400/15" />
      <rect x="79" y="35" width="8" height="50" rx="2" fill="currentColor" className="text-purple-400/15" />
    </svg>
  );
}

const illustrations = [IllustrationDiscovery, IllustrationDevelopment, IllustrationLaunch, IllustrationGrowth];

const steps = [
  { icon: Search, key: "step1", number: "01", gradient: "from-purple-500 to-violet-500", glow: "shadow-purple-500/30" },
  { icon: Code, key: "step2", number: "02", gradient: "from-violet-500 to-indigo-500", glow: "shadow-violet-500/30" },
  { icon: Rocket, key: "step3", number: "03", gradient: "from-indigo-500 to-purple-500", glow: "shadow-indigo-500/30" },
  { icon: TrendingUp, key: "step4", number: "04", gradient: "from-purple-500 to-fuchsia-500", glow: "shadow-purple-500/30" },
] as const;

export default function ProcessTimeline() {
  const t = useTranslations("processTimeline");

  return (
    <section id="process" className="py-28 bg-bg-primary relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-indigo-500/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest text-purple-400 bg-purple-400/10 rounded-full mb-4">
            {t("badge")}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-[family-name:var(--font-syne)] text-text-primary">
            {t("title")}
          </h2>
          <p className="mt-4 text-text-secondary max-w-2xl mx-auto text-lg">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Timeline — Desktop */}
        <div className="hidden md:block relative">
          {/* Animated gradient line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
            <motion.div
              className="w-full h-full bg-gradient-to-b from-purple-500/60 via-violet-500/40 to-indigo-500/60"
              initial={{ scaleY: 0, originY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>

          <div className="space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const Illustration = illustrations[index];
              const isLeft = index % 2 === 0;

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, delay: index * 0.12, ease: "easeOut" }}
                  className="relative flex items-center py-10"
                >
                  {/* Left side */}
                  <div className={`w-1/2 ${isLeft ? "pr-16 text-right" : "pr-16"}`}>
                    {isLeft ? (
                      <div className="ml-auto max-w-sm">
                        <span className={`text-5xl font-[family-name:var(--font-syne)] font-extrabold bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent opacity-30`}>
                          {step.number}
                        </span>
                        <h3 className="mt-2 text-xl font-bold font-[family-name:var(--font-syne)] text-text-primary">
                          {t(`${step.key}Title`)}
                        </h3>
                        <p className="mt-2 text-text-secondary text-sm leading-relaxed">
                          {t(`${step.key}Description`)}
                        </p>
                      </div>
                    ) : (
                      <motion.div
                        className="ml-auto max-w-sm flex justify-end"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6, delay: index * 0.12 + 0.2 }}
                      >
                        <Illustration />
                      </motion.div>
                    )}
                  </div>

                  {/* Center node */}
                  <motion.div
                    className="absolute left-1/2 -translate-x-1/2 z-10"
                    whileHover={{ scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg ${step.glow} rotate-45`}>
                      <Icon className="w-6 h-6 text-white -rotate-45" />
                    </div>
                    {/* Pulse ring */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.gradient} opacity-20 rotate-45 animate-ping`} style={{ animationDuration: "3s" }} />
                  </motion.div>

                  {/* Right side */}
                  <div className={`w-1/2 ${!isLeft ? "pl-16" : "pl-16"}`}>
                    {!isLeft ? (
                      <div className="max-w-sm">
                        <span className={`text-5xl font-[family-name:var(--font-syne)] font-extrabold bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent opacity-30`}>
                          {step.number}
                        </span>
                        <h3 className="mt-2 text-xl font-bold font-[family-name:var(--font-syne)] text-text-primary">
                          {t(`${step.key}Title`)}
                        </h3>
                        <p className="mt-2 text-text-secondary text-sm leading-relaxed">
                          {t(`${step.key}Description`)}
                        </p>
                      </div>
                    ) : (
                      <motion.div
                        className="max-w-sm flex justify-start"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6, delay: index * 0.12 + 0.2 }}
                      >
                        <Illustration />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Timeline — Mobile */}
        <div className="md:hidden relative">
          {/* Vertical line on left */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 via-violet-500/30 to-indigo-500/50" />

          <div className="space-y-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const Illustration = illustrations[index];
              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative flex items-start gap-6 pl-14"
                >
                  {/* Node */}
                  <div className={`absolute left-0 top-0 w-10 h-10 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-md ${step.glow} rotate-45`}>
                    <Icon className="w-4 h-4 text-white -rotate-45" />
                  </div>

                  <div>
                    <span className={`text-3xl font-[family-name:var(--font-syne)] font-extrabold bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent opacity-30`}>
                      {step.number}
                    </span>
                    <h3 className="mt-1 text-lg font-bold font-[family-name:var(--font-syne)] text-text-primary">
                      {t(`${step.key}Title`)}
                    </h3>
                    <p className="mt-1 text-text-secondary text-sm leading-relaxed">
                      {t(`${step.key}Description`)}
                    </p>
                    <div className="mt-3 opacity-60">
                      <Illustration />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
