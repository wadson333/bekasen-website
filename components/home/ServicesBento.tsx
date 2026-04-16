"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Globe, Brain, ArrowRight,
  Clock, Palette, Sparkles, Search,
  Cpu, Plug, Headphones, Tag, Check,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

interface ServicePill {
  key: string;
  icon: typeof Clock;
}

interface ServiceCard {
  titleKey: string;
  descriptionKey: string;
  icon: typeof Globe;
  accentGradient: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  image: string;
  pills: ServicePill[];
  reversed?: boolean;
}

const services: ServiceCard[] = [
  {
    titleKey: "service1Title",
    descriptionKey: "service1Description",
    icon: Globe,
    accentGradient: "from-purple-500 to-violet-500",
    accentBg: "bg-purple-500/10",
    accentText: "text-purple-400",
    accentBorder: "border-purple-500/20",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    pills: [
      { key: "service1Timeline", icon: Clock },
      { key: "service1Price", icon: Tag },
      { key: "service1Feature1", icon: Palette },
      { key: "service1Feature2", icon: Sparkles },
      { key: "service1Feature3", icon: Search },
    ],
  },

  {
    titleKey: "service3Title",
    descriptionKey: "service3Description",
    icon: Brain,
    accentGradient: "from-indigo-500 to-violet-500",
    accentBg: "bg-indigo-500/10",
    accentText: "text-indigo-400",
    accentBorder: "border-indigo-500/20",
    reversed: true,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    pills: [
      { key: "service3Timeline", icon: Clock },
      { key: "service3Price", icon: Tag },
      { key: "service3Feature1", icon: Cpu },
      { key: "service3Feature2", icon: Plug },
      { key: "service3Feature3", icon: Headphones },
    ],
  },
];

export default function ServicesBento() {
  const t = useTranslations("servicesBento");

  return (
    <section
      className="relative pt-28 pb-28 bg-bg-secondary overflow-hidden"
      id="services"
      style={{ clipPath: "polygon(0 4%, 100% 0%, 100% 96%, 0% 100%)" }}
    >
      {/* Decorative geometric shapes */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Dot grid — top left */}
        <svg className="absolute top-16 left-8 w-24 h-24 opacity-[0.08]" viewBox="0 0 80 80">
          {Array.from({ length: 25 }).map((_, i) => (
            <circle key={i} cx={8 + (i % 5) * 16} cy={8 + Math.floor(i / 5) * 16} r="2" className="fill-purple-400" />
          ))}
        </svg>

        {/* Dashed ring — top right */}
        <svg className="absolute top-24 right-12 w-28 h-28 opacity-[0.07]" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" className="stroke-violet-400" strokeWidth="1.5" strokeDasharray="8 6" />
        </svg>

        {/* Small cross — mid left */}
        <svg className="absolute top-1/2 left-6 w-8 h-8 opacity-[0.12] -translate-y-1/2" viewBox="0 0 24 24">
          <path d="M12 4v16M4 12h16" className="stroke-purple-400" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {/* Circle — bottom right */}
        <svg className="absolute bottom-28 right-16 w-10 h-10 opacity-[0.10]" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="14" fill="none" className="stroke-indigo-400" strokeWidth="1.5" />
        </svg>

        {/* Triangle — bottom left */}
        <svg className="absolute bottom-20 left-20 w-12 h-12 opacity-[0.08]" viewBox="0 0 40 40">
          <path d="M20 6 L36 34 L4 34 Z" fill="none" className="stroke-purple-400" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>

        {/* Dot grid — bottom right */}
        <svg className="absolute bottom-32 right-1/4 w-20 h-20 opacity-[0.06]" viewBox="0 0 60 60">
          {Array.from({ length: 16 }).map((_, i) => (
            <circle key={i} cx={7 + (i % 4) * 16} cy={7 + Math.floor(i / 4) * 16} r="1.5" className="fill-indigo-400" />
          ))}
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-purple-400 uppercase"
          >
            {t("badge")}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-3xl md:text-5xl font-[family-name:var(--font-syne)] font-bold text-text-primary max-w-3xl mx-auto"
          >
            {t("title")}{" "}
            <span className="italic bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              {t("titleAccent")}
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-text-secondary max-w-2xl mx-auto text-lg"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* Services */}
        <div className="space-y-16">
          {services.map((service, idx) => {
            const isReversed = service.reversed;

            return (
              <motion.div
                key={service.titleKey}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: idx * 0.1 }}
                className="group"
              >
                {idx > 0 && (
                  <div className="mb-16 border-t border-border" />
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                  {/* Text Content */}
                  <div className={`py-6 lg:py-8 flex flex-col justify-center ${isReversed ? "lg:order-2" : ""}`}>
                    <h3 className="text-2xl md:text-3xl font-[family-name:var(--font-syne)] font-bold text-text-primary">
                      {t(service.titleKey)}
                    </h3>

                    <p className="mt-3 text-text-secondary leading-relaxed max-w-md">
                      {t(service.descriptionKey)}
                    </p>

                    {/* Price Display */}
                    {(() => {
                      const pricePill = service.pills.find((p) => p.key.includes("Price"));
                      const timelinePill = service.pills.find((p) => p.key.includes("Timeline"));
                      const featurePills = service.pills.filter(
                        (p) => !p.key.includes("Price") && !p.key.includes("Timeline")
                      );

                      return (
                        <>
                          <div className="mt-6 flex items-end gap-4">
                            {pricePill && (
                              <div>
                                <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                                  {t("priceLabel")}
                                </span>
                                <p className="text-3xl md:text-4xl font-[family-name:var(--font-syne)] font-extrabold text-text-primary leading-none mt-1">
                                  {t(pricePill.key)}
                                </p>
                              </div>
                            )}
                            {timelinePill && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-text-secondary mb-1">
                                <Clock size={12} />
                                {t(timelinePill.key)}
                              </span>
                            )}
                          </div>

                          {/* Feature Pills */}
                          <div className="mt-5 flex flex-wrap gap-2">
                            {featurePills.map((pill) => (
                              <span
                                key={pill.key}
                                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-transparent px-3.5 py-1.5 text-xs font-medium text-text-secondary"
                              >
                                <Check size={12} className={service.accentText} />
                                {t(pill.key)}
                              </span>
                            ))}
                          </div>
                        </>
                      );
                    })()}


                    <div className="mt-8">
                      <Link
                        href="/start-project"
                        className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${service.accentGradient} px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 group/btn`}
                      >
                        {t("cta")}
                        <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>

                  {/* Image Side */}
                  <div className={`relative py-6 lg:py-8 flex items-center justify-center min-h-[280px] ${isReversed ? "lg:order-1" : ""}`}>

                    <motion.div
                      whileHover={{ rotate: 0, scale: 1.02 }}
                      transition={{ duration: 0.4 }}
                      className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/20 ${isReversed ? "rotate-[-2deg]" : "rotate-[2deg]"} group-hover:shadow-purple-500/10 transition-shadow duration-500`}
                    >
                      <Image
                        src={service.image}
                        alt={t(service.titleKey)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </motion.div>
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
