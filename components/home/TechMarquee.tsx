"use client";

import { useTranslations } from "next-intl";
import {
  Code2,
  Palette,
  Zap,
  CreditCard,
  Database,
  Layers,
  Terminal,
  Coffee,
  Triangle,
  Workflow,
  Bot,
  Sparkles,
  GitBranch,
  type LucideIcon,
} from "lucide-react";

type Tech = { name: string; Icon: LucideIcon; accent: string };

// Grouped by category for visual variety in the marquee
const technologies: Tech[] = [
  { name: "Next.js", Icon: Code2, accent: "text-text-primary" },
  { name: "React", Icon: Layers, accent: "text-sky-500" },
  { name: "Tailwind CSS", Icon: Palette, accent: "text-cyan-500" },
  { name: "PostgreSQL", Icon: Database, accent: "text-blue-500" },
  { name: "Drizzle ORM", Icon: Workflow, accent: "text-emerald-500" },
  { name: "Vercel", Icon: Zap, accent: "text-text-primary" },
  { name: "Stripe", Icon: CreditCard, accent: "text-violet-500" },
  { name: "Python", Icon: Terminal, accent: "text-yellow-500" },
  { name: "Java + Spring", Icon: Coffee, accent: "text-orange-500" },
  { name: "Angular", Icon: Triangle, accent: "text-red-500" },
  { name: "JHipster", Icon: Workflow, accent: "text-emerald-500" },
  { name: "Claude / GPT", Icon: Bot, accent: "text-purple-500" },
  { name: "GitHub Copilot", Icon: Sparkles, accent: "text-violet-500" },
  { name: "Git + GitHub", Icon: GitBranch, accent: "text-orange-500" },
];

/**
 * TechMarquee V2 — premium pills with brand-color icons.
 *
 * Replaces the single-row faded marquee. Now:
 *   - Each tech is a rounded pill with a colored icon (matches the brand)
 *   - Single row, infinite scroll, pause on hover
 *   - Edge gradient masks for clean fade
 *   - The eyebrow line uses a Sparkle icon for premium feel
 */
export default function TechMarquee() {
  const t = useTranslations("techMarquee");

  // Duplicate items for seamless infinite loop
  const items = [...technologies, ...technologies];

  return (
    <section className="relative overflow-hidden bg-bg-primary py-12 lg:py-16">
      <p className="relative z-10 mx-auto mb-8 inline-flex w-full items-center justify-center gap-2 px-6 text-center text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
        <Sparkles className="h-3.5 w-3.5 text-purple-400" />
        {t("title")}
      </p>

      {/* Edge gradient masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg-primary to-transparent sm:w-40" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg-primary to-transparent sm:w-40" />

      <div className="group relative">
        <div className="flex w-max animate-marquee gap-3 motion-reduce:animate-none group-hover:[animation-play-state:paused]">
          {items.map((tech, idx) => (
            <div
              key={`${tech.name}-${idx}`}
              className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-bg-card px-5 py-3 transition-colors hover:border-purple-400/40"
            >
              <tech.Icon size={18} strokeWidth={1.75} className={tech.accent} />
              <span className="text-sm font-medium text-text-primary whitespace-nowrap">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
