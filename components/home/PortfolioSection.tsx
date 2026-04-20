"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Monitor, Smartphone, Tablet, Eye, X } from "lucide-react";
// import { Link } from "@/i18n/navigation";
// import { ArrowRight } from "lucide-react";
import Image from "next/image";

interface Project {
  slug: string;
  titleKey: string;
  descriptionKey: string;
  tags: string[];
  images: { desktop: string; mobile: string; tablet: string };
  url: string;
}

const mockupByTab: Record<TabKey, { width: string; height: string; radius: string }> = {
  desktop: { width: "w-full", height: "h-full", radius: "rounded-xl" },
  tablet: { width: "w-[75%]", height: "h-full", radius: "rounded-2xl" },
  mobile: { width: "w-[35%]", height: "h-[95%]", radius: "rounded-2xl" },
};

const projects: Project[] = [
  {
    slug: "clinix-pro",
    titleKey: "project1Title",
    descriptionKey: "project1Description",
    tags: ["JHipster", "Angular", "PostgreSQL"],
    images: {
      desktop: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
      mobile: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&q=80",
      tablet: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80",
    },
    url: "clinix-pro.bekasen.com",
  },
  {
    slug: "horizon-hotel",
    titleKey: "project2Title",
    descriptionKey: "project2Description",
    tags: ["JHipster", "Spring Boot"],
    images: {
      desktop: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      mobile: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80",
      tablet: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80",
    },
    url: "horizon-hotel.bekasen.com",
  },
  {
    slug: "aura-market",
    titleKey: "project3Title",
    descriptionKey: "project3Description",
    tags: ["Next.js", "Tailwind"],
    images: {
      desktop: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
      mobile: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&q=80",
      tablet: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80",
    },
    url: "aura-market.bekasen.com",
  },
  {
    slug: "impact-global",
    titleKey: "project4Title",
    descriptionKey: "project4Description",
    tags: ["Next.js", "Framer Motion"],
    images: {
      desktop: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
      mobile: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&q=80",
      tablet: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
    },
    url: "impact-global.bekasen.com",
  },
];

const vFormation = [
  { x: -100, y: -60, rotate: -4, scale: 0.92 },
  { x: 100, y: -60, rotate: 4, scale: 0.92 },
  { x: -180, y: 40, rotate: -6, scale: 0.88 },
  { x: 180, y: 40, rotate: 6, scale: 0.88 },
];

const kineticKeys = ["kineticText1", "kineticText2", "kineticText3"] as const;

type TabKey = "desktop" | "mobile" | "tablet";

const tabs: { key: TabKey; labelKey: string; icon: typeof Monitor }[] = [
  { key: "desktop", labelKey: "tabDesktop", icon: Monitor },
  { key: "mobile", labelKey: "tabMobile", icon: Smartphone },
  { key: "tablet", labelKey: "tabTablet", icon: Tablet },
];

export default function PortfolioSection() {
  const t = useTranslations("portfolioSection");
  const [activeTab, setActiveTab] = useState<TabKey>("desktop");
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  return (
    <section className="relative z-10 py-24 bg-bg-primary" id="portfolio">
      <div className="max-w-6xl mx-auto px-6">
        {/* ─── Who's Behind Bekasen ─── */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-purple-400 uppercase">
              <Sparkles size={12} />
              {t("whoBehindBadge")}
            </span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-2xl md:text-4xl lg:text-[2.75rem] font-[family-name:var(--font-syne)] font-bold text-text-primary leading-[1.15]"
              >
                {t("whoBehindTitle")}{" "}
                <span className="italic bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                  {t("whoBehindTitleAccent")}
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 text-base md:text-lg text-text-secondary font-[family-name:var(--font-inter)] leading-relaxed max-w-lg"
              >
                {t("whoBehindDescription")}
              </motion.p>
            </div>

            {/* Visual — floating brand mark */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="flex items-center justify-center"
            >
              <div className="relative w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-600/25 via-indigo-500/15 to-transparent blur-3xl" />
                <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-purple-500/10 to-indigo-500/5 blur-xl animate-pulse" />
                <div className="relative w-full h-full rounded-3xl border border-purple-500/20 bg-white/[0.03] backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  <Image
                    src="/logo-letter-clean.png"
                    alt="Bekasen"
                    width={160}
                    height={160}
                    className="w-28 h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                  />
                  <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-purple-400/40" />
                  <div className="absolute bottom-7 left-7 w-3 h-3 rounded-full bg-indigo-400/30" />
                  <div className="absolute top-1/3 right-10 w-1.5 h-1.5 rounded-full bg-violet-400/50" />
                  <div className="absolute bottom-1/3 left-10 w-1 h-1 rounded-full bg-purple-300/40" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ─── Section Title ─── */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-[family-name:var(--font-syne)] font-bold text-text-primary text-center max-w-3xl mx-auto"
        >
          {t("title")}
        </motion.h2>

        {/* Kinetic text */}
        <div className="flex justify-center gap-3 md:gap-5 mt-6 mb-14">
          {kineticKeys.map((key, i) => (
            <motion.span
              key={key}
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{
                delay: 0.3 + i * 0.15,
                duration: 0.6,
                ease: "easeOut",
              }}
              className="text-lg md:text-2xl font-[family-name:var(--font-syne)] font-semibold text-purple-400"
            >
              {t(key)}
            </motion.span>
          ))}
        </div>

        {/* ─── Tabs (sticky while cards visible) ─── */}
        <div className="sticky top-16 lg:top-20 z-20 -mx-6 px-6 py-3 bg-bg-primary/80 backdrop-blur-lg mb-6">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1 rounded-full border border-border bg-bg-card p-1 shadow-lg shadow-black/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/[0.05]"
                  }`}
                >
                  <Icon size={15} />
                  {t(tab.labelKey)}
                </button>
              );
            })}
            </div>
          </div>
        </div>

        {/* ─── 2×2 Grid — V-formation entry ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, idx) => (
            <motion.div
              key={project.slug}
              initial={{
                opacity: 0,
                x: vFormation[idx].x,
                y: vFormation[idx].y,
                rotate: vFormation[idx].rotate,
                scale: vFormation[idx].scale,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
                y: 0,
                rotate: 0,
                scale: 1,
              }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                delay: idx * 0.08,
                duration: 0.7,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="group relative rounded-2xl border border-border bg-bg-card overflow-hidden hover:border-purple-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/[0.04] transition-all duration-300"
            >
              {/* Browser mockup — fixed card area, device frame centers inside */}
              <div className="p-4">
                <div className="relative aspect-video overflow-hidden bg-white/[0.01]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`${mockupByTab[activeTab].width} ${mockupByTab[activeTab].height} ${mockupByTab[activeTab].radius} border border-white/[0.06] bg-white/[0.02] overflow-hidden flex flex-col transition-[width,height,border-radius] duration-500`}>
                      {/* Browser chrome bar */}
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] border-b border-white/[0.06] shrink-0">
                        <div className="w-2 h-2 rounded-full bg-[#FF5F57]/70" />
                        <div className="w-2 h-2 rounded-full bg-[#FEBC2E]/70" />
                        <div className="w-2 h-2 rounded-full bg-[#28C840]/70" />
                        <div className="flex-1 ml-2 rounded-md bg-white/[0.05] px-3 py-0.5 text-[10px] text-text-secondary/60 font-mono truncate">
                          {project.url}
                        </div>
                      </div>
                      {/* Screenshot */}
                      <div className="relative flex-1 min-h-0">
                        <Image
                          key={activeTab}
                          src={project.images[activeTab]}
                          alt={t(project.titleKey)}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reveal button */}
              <button
                onClick={() => setExpandedSlug(expandedSlug === project.slug ? null : project.slug)}
                className="absolute bottom-3 right-3 z-20 w-9 h-9 rounded-full bg-purple-600/80 backdrop-blur-sm border border-purple-400/30 flex items-center justify-center text-white hover:bg-purple-500 hover:scale-110 transition-all duration-300 shadow-lg shadow-purple-500/25"
                aria-label={t(expandedSlug === project.slug ? "hideDetails" : "showDetails")}
              >
                {expandedSlug === project.slug ? <X size={16} /> : <Eye size={16} />}
              </button>

              {/* Info overlay — cinematic reveal */}
              <AnimatePresence>
                {expandedSlug === project.slug && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-[2px]"
                    onClick={() => setExpandedSlug(null)}
                  >
                    <div className="p-5" onClick={(e) => e.stopPropagation()}>
                      {/* Accent gradient line */}
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="w-12 h-0.5 bg-gradient-to-r from-purple-400 to-violet-400 rounded-full mb-3 origin-left"
                      />
                      <motion.h3
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.4 }}
                        className="text-lg font-[family-name:var(--font-syne)] font-bold text-white"
                      >
                        {t(project.titleKey)}
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.4 }}
                        className="mt-1.5 text-sm text-white/70 line-clamp-2"
                      >
                        {t(project.descriptionKey)}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.4 }}
                        className="mt-3 flex flex-wrap gap-1.5"
                      >
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white/10 border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/80"
                          >
                            {tag}
                          </span>
                        ))}
                      </motion.div>
                      {/* View project link - hidden for now
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.4 }}
                      >
                        <Link
                          href={`/portfolio/${project.slug}`}
                          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-purple-300 hover:text-purple-200 transition-colors"
                        >
                          {t("viewProject")}
                          <ArrowRight size={14} />
                        </Link>
                      </motion.div>
                      */}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* CTA - hidden for now */}
      </div>
    </section>
  );
}
