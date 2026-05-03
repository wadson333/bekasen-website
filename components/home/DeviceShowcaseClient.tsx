"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Monitor, Tablet, Smartphone, ArrowUpRight, type LucideIcon } from "lucide-react";

type Locale = "fr" | "en" | "ht" | "es";

type Project = {
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  demoUrl: string | null;
  techStack: string[];
  category: string;
};

type Tab = "desktop" | "tablet" | "mobile";

const TABS: { key: Tab; Icon: LucideIcon; label: Record<Locale, string> }[] = [
  { key: "desktop", Icon: Monitor,    label: { fr: "Bureau",   en: "Desktop", ht: "Òdinatè",  es: "Escritorio" } },
  { key: "tablet",  Icon: Tablet,     label: { fr: "Tablette", en: "Tablet",  ht: "Tablèt",   es: "Tableta" } },
  { key: "mobile",  Icon: Smartphone, label: { fr: "Mobile",   en: "Mobile",  ht: "Mobil",    es: "Móvil" } },
];

const FRAME: Record<Tab, { containerClass: string; aspectClass: string; label: string }> = {
  desktop: {
    containerClass: "w-full max-w-3xl",
    aspectClass: "aspect-[16/10]",
    label: "1920 × 1200",
  },
  tablet: {
    containerClass: "w-full max-w-md",
    aspectClass: "aspect-[3/4]",
    label: "1024 × 1366",
  },
  mobile: {
    containerClass: "w-[260px]",
    aspectClass: "aspect-[9/19]",
    label: "390 × 844",
  },
};

const COPY: Record<Locale, { eyebrow: string; title: string; subtitle: string; viewDemo: string; viewProject: string; pixelPerfect: string }> = {
  fr: {
    eyebrow: "Responsive par défaut",
    title: "Une expérience pixel-perfect sur tous les écrans",
    subtitle: "Chaque projet est conçu mobile-first puis adapté pour tablette et desktop. Survolez les onglets pour voir le rendu.",
    viewDemo: "Voir la démo",
    viewProject: "Voir le projet",
    pixelPerfect: "Pixel-perfect",
  },
  en: {
    eyebrow: "Responsive by default",
    title: "A pixel-perfect experience on every screen",
    subtitle: "Every project is designed mobile-first then adapted for tablet and desktop. Hover the tabs to preview.",
    viewDemo: "View live demo",
    viewProject: "View project",
    pixelPerfect: "Pixel-perfect",
  },
  ht: {
    eyebrow: "Responsive pa default",
    title: "Yon eksperyans pixel-perfect sou tout ekran",
    subtitle: "Chak pwojè konsevwa mobile-first epi adapte pou tablèt ak òdinatè. Pase sou onglè yo pou wè.",
    viewDemo: "Wè demo a",
    viewProject: "Wè pwojè a",
    pixelPerfect: "Pixel-perfect",
  },
  es: {
    eyebrow: "Responsive por defecto",
    title: "Una experiencia pixel-perfect en cada pantalla",
    subtitle: "Cada proyecto se diseña mobile-first y se adapta para tablet y escritorio. Pasa por las pestañas para ver.",
    viewDemo: "Ver demo en vivo",
    viewProject: "Ver proyecto",
    pixelPerfect: "Pixel-perfect",
  },
};

/**
 * DeviceShowcase — restored from the deleted PortfolioSection feature.
 * Renders ONE featured project at a time inside a switchable browser /
 * tablet / mobile frame. Click a tab to swap viewport, click the card
 * to open the live demo or the portfolio detail page.
 *
 * Replaces the old hardcoded carousel — now reads from DB and shows
 * the most recent featured project.
 */
export default function DeviceShowcaseClient({
  project,
  locale,
}: {
  project: Project;
  locale: Locale;
}) {
  const [tab, setTab] = useState<Tab>("desktop");
  const reduced = useReducedMotion();
  const copy = COPY[locale];
  const frame = FRAME[tab];
  const href = project.demoUrl ?? `/${locale}/portfolio/${project.slug}`;
  const isExternal = !!project.demoUrl;

  return (
    <section className="relative overflow-hidden bg-bg-secondary py-24">
      {/* Soft accent background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/[0.06] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-400">
            {copy.eyebrow}
          </span>
          <h2 className="mt-6 font-(family-name:--font-syne) text-3xl font-bold text-text-primary md:text-5xl">
            {copy.title}
          </h2>
          <p className="mt-4 text-lg text-text-secondary">{copy.subtitle}</p>
        </header>

        {/* Tabs (wrapped in a flex parent for bullet-proof centering) */}
        <div className="mb-10 flex justify-center">
          <div className="inline-flex w-full max-w-md flex-wrap items-center justify-center gap-2 rounded-full border border-border bg-bg-card/50 p-1.5 backdrop-blur-sm sm:gap-1">
          {TABS.map(({ key, Icon, label }) => {
            const isActive = key === tab;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                aria-pressed={isActive}
                className={`relative inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors cursor-pointer sm:text-sm ${
                  isActive
                    ? "text-white"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {isActive ? (
                  <motion.span
                    layoutId="device-tab-indicator"
                    className="absolute inset-0 -z-10 rounded-full bg-purple-600"
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 300, damping: 30 }
                    }
                  />
                ) : null}
                <Icon className="h-3.5 w-3.5" />
                <span>{label[locale]}</span>
              </button>
            );
          })}
          </div>
        </div>

        {/* Stage */}
        <div className="flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={reduced ? false : { opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: reduced ? 0 : 0.35, ease: "easeOut" }}
              className={`${frame.containerClass} relative`}
            >
              {tab === "desktop" ? (
                <DesktopFrame project={project} aspect={frame.aspectClass} />
              ) : tab === "tablet" ? (
                <TabletFrame project={project} aspect={frame.aspectClass} />
              ) : (
                <MobileFrame project={project} aspect={frame.aspectClass} />
              )}

              {/* Viewport label */}
              <p className="mt-4 text-center text-xs uppercase tracking-wider text-text-secondary">
                {frame.label} · {copy.pixelPerfect}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Project details */}
        <div className="mx-auto mt-10 max-w-3xl text-center">
          <h3 className="font-(family-name:--font-syne) text-xl font-bold text-text-primary md:text-2xl">
            {project.title}
          </h3>
          <p className="mt-2 text-sm text-text-secondary md:text-base">{project.description}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {project.techStack.slice(0, 5).map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border bg-bg-card px-2.5 py-1 text-[11px] text-text-secondary"
              >
                {tech}
              </span>
            ))}
          </div>
          <Link
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-500 cursor-pointer"
          >
            {isExternal ? copy.viewDemo : copy.viewProject}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Frames ─────────────────────────────────────────────────────────────────

function DesktopFrame({ project, aspect }: { project: Project; aspect: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-bg-card shadow-[0_30px_80px_rgba(15,23,42,0.18)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-bg-secondary px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400/70" />
          <span className="h-3 w-3 rounded-full bg-amber-400/70" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
        </div>
        <div className="ml-3 flex flex-1 items-center justify-center">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-bg-card px-3 py-1 text-[11px] text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {project.demoUrl ? project.demoUrl.replace(/^https?:\/\//, "") : `${project.slug}.bekasen.com`}
          </div>
        </div>
      </div>
      {/* Viewport */}
      <div className={`${aspect} w-full overflow-hidden bg-bg-card`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
}

function TabletFrame({ project, aspect }: { project: Project; aspect: string }) {
  return (
    <div className="rounded-[2rem] border-[10px] border-text-primary/85 bg-text-primary/85 p-1.5 shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
      <div className={`${aspect} w-full overflow-hidden rounded-2xl bg-bg-card`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
}

function MobileFrame({ project, aspect }: { project: Project; aspect: string }) {
  return (
    <div className="relative rounded-[2.5rem] border-[8px] border-text-primary/85 bg-text-primary/85 p-1 shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
      {/* Notch */}
      <div className="absolute left-1/2 top-1.5 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-text-primary/85" />
      <div className={`${aspect} w-full overflow-hidden rounded-[2rem] bg-bg-card`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
}
