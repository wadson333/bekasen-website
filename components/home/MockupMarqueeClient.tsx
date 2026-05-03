"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Monitor, Tablet, Smartphone, type LucideIcon } from "lucide-react";

type Locale = "fr" | "en" | "ht" | "es";
type Tab = "desktop" | "tablet" | "mobile";

type Project = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  demoUrl: string | null;
};

const TABS: { key: Tab; Icon: LucideIcon; label: Record<Locale, string> }[] = [
  { key: "desktop", Icon: Monitor,    label: { fr: "Bureau",   en: "Desktop", ht: "Òdinatè",  es: "Escritorio" } },
  { key: "tablet",  Icon: Tablet,     label: { fr: "Tablette", en: "Tablet",  ht: "Tablèt",   es: "Tableta" } },
  { key: "mobile",  Icon: Smartphone, label: { fr: "Mobile",   en: "Mobile",  ht: "Mobil",    es: "Móvil" } },
];

const COPY: Record<Locale, { eyebrow: string; hover: string }> = {
  fr: {
    eyebrow: "Responsive par défaut",
    hover: "Cliquez sur un onglet pour voir le rendu",
  },
  en: {
    eyebrow: "Responsive by default",
    hover: "Click a tab to switch viewport",
  },
  ht: {
    eyebrow: "Responsive pa default",
    hover: "Klike yon onglè pou chanje vi a",
  },
  es: {
    eyebrow: "Responsive por defecto",
    hover: "Haz clic en una pestaña para cambiar la vista",
  },
};

/**
 * MockupMarquee — infinite horizontal scroll of portfolio thumbnails with
 * a tab switcher (Desktop / Tablet / Mobile) that swaps the device frame
 * for ALL items in the marquee.
 *
 * Server fetches the projects, this client component handles tab state +
 * rendering. The animation pauses on hover. Reduced-motion safe.
 */
export default function MockupMarqueeClient({
  projects,
  locale,
}: {
  projects: Project[];
  locale: Locale;
}) {
  const [tab, setTab] = useState<Tab>("desktop");
  const reduced = useReducedMotion();
  const copy = COPY[locale];

  // Duplicate the list so the CSS marquee loops seamlessly.
  const items = [...projects, ...projects];

  return (
    <section className="relative overflow-hidden bg-bg-primary py-12 lg:py-16">
      {/* Header — eyebrow + tabs */}
      <div className="relative mx-auto mb-8 flex flex-col items-center gap-5 px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-400">
          {copy.eyebrow}
        </p>

        {/* Tab switcher (centered) */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-bg-card/50 p-1.5 backdrop-blur-sm">
            {TABS.map(({ key, Icon, label }) => {
              const isActive = key === tab;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  aria-pressed={isActive}
                  className={`relative inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors cursor-pointer sm:text-sm ${
                    isActive ? "text-white" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="marquee-tab-indicator"
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
      </div>

      {/* Edge gradient masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg-primary to-transparent sm:w-40" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg-primary to-transparent sm:w-40" />

      {/* Marquee track */}
      <div className="group relative">
        <div className="flex w-max animate-marquee gap-6 motion-reduce:animate-none group-hover:[animation-play-state:paused]">
          {items.map((p, idx) => {
            const domain = p.demoUrl
              ? p.demoUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
              : `${p.slug}.bekasen.com`;
            const href = p.demoUrl ?? `/${locale}/portfolio/${p.slug}`;

            return (
              <a
                key={`${p.id}-${idx}`}
                href={href}
                target={p.demoUrl ? "_blank" : undefined}
                rel={p.demoUrl ? "noopener noreferrer" : undefined}
                className="group/card shrink-0 cursor-pointer"
              >
                {tab === "desktop" ? (
                  <DesktopFrame project={p} domain={domain} />
                ) : tab === "tablet" ? (
                  <TabletFrame project={p} />
                ) : (
                  <MobileFrame project={p} />
                )}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Frames ─────────────────────────────────────────────────────────────────

function DesktopFrame({ project, domain }: { project: Project; domain: string }) {
  return (
    <div className="w-[560px] overflow-hidden rounded-2xl border border-border bg-bg-card shadow-[0_16px_48px_rgba(15,23,42,0.10)] transition-shadow group-hover/card:shadow-[0_24px_60px_rgba(124,58,237,0.22)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.45)] sm:w-[640px] lg:w-[720px]">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-bg-secondary px-5 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400/70" />
        <span className="h-3 w-3 rounded-full bg-amber-400/70" />
        <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
        <div className="ml-3 inline-flex items-center gap-1.5 truncate rounded-md bg-bg-card px-3 py-1 text-[11px] text-text-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {domain}
        </div>
      </div>
      <div className="aspect-[16/10] w-full overflow-hidden bg-bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-[1.02]"
          loading="lazy"
        />
      </div>
    </div>
  );
}

function TabletFrame({ project }: { project: Project }) {
  return (
    <div className="w-[340px] rounded-[1.75rem] border-[8px] border-text-primary/85 bg-text-primary/85 p-1 shadow-[0_16px_48px_rgba(15,23,42,0.18)] transition-shadow group-hover/card:shadow-[0_24px_60px_rgba(124,58,237,0.22)] sm:w-[400px]">
      <div className="aspect-[3/4] w-full overflow-hidden rounded-[1.25rem] bg-bg-card">
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

function MobileFrame({ project }: { project: Project }) {
  return (
    <div className="relative w-[200px] rounded-[2rem] border-[6px] border-text-primary/85 bg-text-primary/85 p-1 shadow-[0_16px_48px_rgba(15,23,42,0.18)] transition-shadow group-hover/card:shadow-[0_24px_60px_rgba(124,58,237,0.22)] sm:w-[230px]">
      {/* Notch */}
      <div className="absolute left-1/2 top-1 z-10 h-4 w-16 -translate-x-1/2 rounded-b-2xl bg-text-primary/85" />
      <div className="aspect-[9/19] w-full overflow-hidden rounded-[1.5rem] bg-bg-card">
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
