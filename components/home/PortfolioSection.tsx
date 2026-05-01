"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  Monitor,
  Smartphone,
  Tablet,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
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
  isInDev?: boolean;
}

const mockupByTab: Record<TabKey, { width: string; height: string; radius: string }> = {
  desktop: { width: "w-full", height: "h-full", radius: "rounded-[2.25rem]" },
  tablet: { width: "w-[72%]", height: "h-[88%]", radius: "rounded-[1.75rem]" },
  mobile: { width: "w-[34%]", height: "h-[90%]", radius: "rounded-[1.75rem]" },
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
    isInDev: true,
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
    isInDev: true,
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
    isInDev: true,
  },
];

const kineticKeys = ["kineticText1", "kineticText2", "kineticText3"] as const;

type TabKey = "desktop" | "mobile" | "tablet";

const tabs: { key: TabKey; labelKey: string; icon: typeof Monitor }[] = [
  { key: "desktop", labelKey: "tabDesktop", icon: Monitor },
  { key: "mobile", labelKey: "tabMobile", icon: Smartphone },
  { key: "tablet", labelKey: "tabTablet", icon: Tablet },
];

const getCardLayerState = (index: number, activeIndex: number) => {
  const distanceFromActive = Math.abs(index - activeIndex);

  if (distanceFromActive === 0) {
    return "z-20 shadow-[0_34px_90px_rgba(15,23,42,0.32)]";
  }

  if (distanceFromActive === 1) {
    return "z-10";
  }

  return "z-0";
};

const getCardMotionState = (index: number, activeIndex: number) => {
  const distanceFromActive = Math.abs(index - activeIndex);

  if (distanceFromActive === 0) {
    return { opacity: 1, scale: 1, filter: "blur(0px)" };
  }

  if (distanceFromActive === 1) {
    return { opacity: 0.7, scale: 0.94, filter: "blur(1.5px)" };
  }

  return { opacity: 0.4, scale: 0.9, filter: "blur(4px)" };
};

const renderProjectMedia = ({
  src,
  title,
}: {
  src: string;
  title: string;
}) => {
  if (src.endsWith(".gif")) {
    return (
      <Image
        src={src}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        unoptimized
      />
    );
  }

  return (
    <Image
      src={src}
      alt={title}
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      sizes="(max-width: 768px) calc(100vw - 3rem), (max-width: 1280px) 640px, 720px"
      unoptimized={src.startsWith("http")}
    />
  );
};

export default function PortfolioSection() {
  const t = useTranslations("portfolioSection");
  const [activeTab, setActiveTab] = useState<TabKey>("desktop");
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const autoResumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setAutoPauseFor = (duration = 8000) => {
    setIsAutoPaused(true);

    if (autoResumeTimeoutRef.current) {
      clearTimeout(autoResumeTimeoutRef.current);
    }

    autoResumeTimeoutRef.current = setTimeout(() => {
      setIsAutoPaused(false);
      autoResumeTimeoutRef.current = null;
    }, duration);
  };

  const clearAutoPause = () => {
    if (autoResumeTimeoutRef.current) {
      clearTimeout(autoResumeTimeoutRef.current);
      autoResumeTimeoutRef.current = null;
    }

    setIsAutoPaused(false);
  };

  const scrollToCard = (index: number) => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const cards = Array.from(scroller.children) as HTMLDivElement[];
    const target = cards[index];

    if (!target) {
      return;
    }

    const targetLeft = target.offsetLeft + target.clientWidth / 2 - scroller.clientWidth / 2;

    scroller.scrollTo({
      left: targetLeft,
      behavior: "smooth",
    });

    setActiveCardIndex(index);
  };

  const handleScroll = () => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const cards = Array.from(scroller.children) as HTMLDivElement[];

    if (cards.length === 0) {
      return;
    }

    const scrollerCenter = scroller.scrollLeft + scroller.clientWidth / 2;

    const nearestIndex = cards.reduce((closestIndex, card, index) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const closestCard = cards[closestIndex];
      const closestCenter = closestCard.offsetLeft + closestCard.clientWidth / 2;

      return Math.abs(cardCenter - scrollerCenter) < Math.abs(closestCenter - scrollerCenter)
        ? index
        : closestIndex;
    }, 0);

    if (nearestIndex !== activeCardIndex) {
      setActiveCardIndex(nearestIndex);
    }
  };

  const scrollToPreviousCard = () => {
    setAutoPauseFor();
    scrollToCard((activeCardIndex - 1 + projects.length) % projects.length);
  };

  const scrollToNextCard = () => {
    setAutoPauseFor();
    scrollToCard((activeCardIndex + 1) % projects.length);
  };

  useEffect(() => {
    return () => {
      if (autoResumeTimeoutRef.current) {
        clearTimeout(autoResumeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isAutoPaused || expandedSlug) {
      return;
    }

    const timeoutId = setTimeout(() => {
      scrollToCard((activeCardIndex + 1) % projects.length);
    }, 4800);

    return () => clearTimeout(timeoutId);
  }, [activeCardIndex, expandedSlug, isAutoPaused]);

  return (
    <section className="relative z-10 py-24 bg-bg-primary overflow-hidden" id="portfolio">
      {/* Background images */}
      <Image
        src="/images/home/portfolio_light.png"
        alt="Portfolio background"
        fill
        className="object-cover object-center absolute inset-0 z-[-2] dark:hidden"
      />
      <Image
        src="/images/home/portfolio_dark.png"
        alt="Portfolio background"
        fill
        className="object-cover object-center absolute inset-0 z-[-2] hidden dark:block"
      />
      {/* Overlay for legibility */}
      <div className="absolute inset-0 z-[-1] bg-white/70 dark:bg-black/60 backdrop-blur-[2px]" />

      <div className="max-w-6xl mx-auto px-6">
        {/* ─── Who's Behind Bekasen ─── */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
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
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
                className="text-2xl md:text-4xl lg:text-[2.75rem] font-(family-name:--font-syne) font-bold text-text-primary leading-[1.15]"
              >
                {t("whoBehindTitle")}{" "}
                <span className="italic bg-linear-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                  {t("whoBehindTitleAccent")}
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
                className="mt-6 text-base md:text-lg text-text-secondary font-(family-name:--font-inter) leading-relaxed max-w-lg"
              >
                {t("whoBehindDescription")}
              </motion.p>
            </div>

            {/* Visual — floating brand mark */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
              className="flex items-center justify-center"
            >
              <div className="relative w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80">
                <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-purple-600/25 via-indigo-500/15 to-transparent blur-3xl" />
                <div className="absolute -inset-3 rounded-4xl bg-linear-to-br from-purple-500/10 to-indigo-500/5 blur-xl animate-pulse" />
                <div className="relative w-full h-full rounded-3xl border border-purple-500/20 bg-white/3 backdrop-blur-sm flex items-center justify-center overflow-hidden">
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
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="text-3xl md:text-5xl font-(family-name:--font-syne) font-bold text-text-primary text-center max-w-3xl mx-auto"
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
              className="text-lg md:text-2xl font-(family-name:--font-syne) font-semibold text-purple-400"
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
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                        : "text-text-secondary hover:text-text-primary hover:bg-white/5"
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

        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          onMouseEnter={() => setIsAutoPaused(true)}
          onMouseLeave={clearAutoPause}
          onFocusCapture={() => setIsAutoPaused(true)}
          onBlurCapture={clearAutoPause}
          onTouchStart={() => setIsAutoPaused(true)}
          onTouchEnd={() => setAutoPauseFor(6000)}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-6 pb-6 perspective-distant [scrollbar-width:none] [-ms-overflow-style:none] md:px-12 xl:px-20 [&::-webkit-scrollbar]:hidden"
        >
          {projects.map((project, idx) => (
            <motion.div
              key={project.slug}
              initial={{
                opacity: 0,
                x: 60,
                y: 24,
                rotate: idx % 2 === 0 ? -1.5 : 1.5,
                scale: 0.97,
                filter: "blur(8px)",
              }}
              animate={{
                x: 0,
                y: 0,
                rotate: 0,
                ...getCardMotionState(idx, activeCardIndex),
              }}
              transition={{
                delay: idx * 0.08,
                type: "spring",
                stiffness: 80,
                damping: 15,
              }}
              className={`group relative h-124 w-[84vw] shrink-0 snap-center overflow-hidden rounded-[2.25rem] bg-transparent transition-shadow duration-500 ease-out md:h-152 md:w-2xl lg:w-4xl xl:w-240 ${getCardLayerState(idx, activeCardIndex)}`}
            >
              <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-transparent to-indigo-500/15" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(67,56,202,0.18),transparent_30%)]" />
              <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/15 to-transparent" />

              <div className="absolute inset-0">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`${mockupByTab[activeTab].width} ${mockupByTab[activeTab].height} ${mockupByTab[activeTab].radius} flex flex-col overflow-hidden transition-[width,height,border-radius] duration-500 ${
                      activeTab === "desktop"
                        ? "bg-transparent"
                        : "border border-white/10 bg-[#0d1020]/88 shadow-[0_24px_60px_rgba(15,23,42,0.45)]"
                    }`}
                  >
                    <div className="flex shrink-0 items-center gap-1.5 border-b border-white/10 bg-black/28 px-3 py-2.5 backdrop-blur-sm">
                      <div className="h-2 w-2 rounded-full bg-[#FF5F57]/80" />
                      <div className="h-2 w-2 rounded-full bg-[#FEBC2E]/80" />
                      <div className="h-2 w-2 rounded-full bg-[#28C840]/80" />
                      <div className="ml-2 flex-1 truncate rounded-md bg-white/6 px-3 py-1 text-[10px] text-white/60 font-mono">
                        {project.url}
                      </div>
                    </div>

                    <div className="relative min-h-0 flex-1">
                      {renderProjectMedia({
                        src: project.images[activeTab],
                        title: t(project.titleKey),
                      })}
                    </div>
                  </div>
                </div>

                <div className="absolute right-4 top-4 z-30 w-[min(22rem,calc(100%-2rem))] overflow-hidden rounded-[1.6rem] border border-purple-400/18 bg-[#070711]/55 text-left shadow-[0_22px_70px_rgba(15,23,42,0.36)] backdrop-blur-2xl md:right-5 md:top-5 md:w-92">
                  <div className="px-4 pb-3 pt-4 md:px-5 md:pt-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className="inline-flex rounded-full border border-amber-400/30 bg-amber-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200">
                          {t("demoBadge")}
                        </span>
                        <h3 className="mt-3 text-xl font-(family-name:--font-syne) font-bold leading-tight text-white md:text-2xl">
                          {t(project.titleKey)}
                        </h3>
                        {project.isInDev ? (
                          <p className="mt-2 truncate text-xs font-medium text-purple-100/72 md:text-sm">
                            {project.url}
                          </p>
                        ) : (
                          <a
                            href={`https://${project.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-purple-200 underline-offset-4 transition hover:text-purple-100 hover:underline md:text-sm"
                          >
                            {t("liveDemo")}
                          </a>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAutoPauseFor(10000);
                          setExpandedSlug((currentSlug) =>
                            currentSlug === project.slug ? null : project.slug,
                          );
                        }}
                        className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-purple-300/18 bg-purple-500/10 text-purple-100 transition hover:border-purple-300/35 hover:bg-purple-500/18"
                        aria-expanded={expandedSlug === project.slug}
                        aria-label={t(expandedSlug === project.slug ? "hideDetails" : "showDetails")}
                      >
                        {expandedSlug === project.slug ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {expandedSlug === project.slug ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-purple-200/10 px-4 pb-4 pt-3 text-white/88 md:px-5 md:pb-5">
                          <p className="text-sm leading-relaxed text-white/82">
                            {t(project.descriptionKey)}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {project.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-purple-300/16 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-100/86"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={scrollToPreviousCard}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-bg-card text-text-primary shadow-[0_10px_30px_rgba(15,23,42,0.16)] transition hover:bg-bg-secondary"
            aria-label={t("scrollPrevious")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            {projects.map((project, index) => (
              <button
                key={project.slug}
                type="button"
                onClick={() => {
                  setAutoPauseFor();
                  scrollToCard(index);
                }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  activeCardIndex === index
                    ? "w-8 bg-purple-500"
                    : "w-2.5 bg-border hover:bg-text-secondary"
                }`}
                aria-label={`${t("viewProject")} ${t(project.titleKey)}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={scrollToNextCard}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-bg-card text-text-primary shadow-[0_10px_30px_rgba(15,23,42,0.16)] transition hover:bg-bg-secondary"
            aria-label={t("scrollNext")}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* CTA - hidden for now */}
      </div>
    </section>
  );
}
