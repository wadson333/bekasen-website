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
  GitFork,
} from "lucide-react";

const technologies = [
  { name: "Next.js", Icon: Code2 },
  { name: "React", Icon: Layers },
  { name: "Tailwind CSS", Icon: Palette },
  { name: "Vercel", Icon: Zap },
  { name: "Stripe", Icon: CreditCard },
  { name: "Supabase", Icon: Database },
  { name: "Python", Icon: Terminal },
  { name: "Java", Icon: Coffee },
  { name: "Angular", Icon: Triangle },
  { name: "JHipster", Icon: Workflow },
  { name: "PostgreSQL", Icon: Database },
  { name: "Claude Code", Icon: Bot },
  { name: "GitHub Copilot", Icon: Sparkles },
  { name: "Git", Icon: GitBranch },
  { name: "GitHub", Icon: GitFork },
];

export default function TechMarquee() {
  const t = useTranslations("techMarquee");

  // Duplicate items for seamless infinite loop
  const items = [...technologies, ...technologies];

  return (
    <section className="relative py-10 overflow-hidden bg-[var(--bg-primary)]">

      <p className="relative text-center text-xs sm:text-sm text-text-secondary mb-6 tracking-widest uppercase font-medium font-(family-name:--font-syne)">
        {t("title")}
      </p>

      <div
        className="relative"
        
      >
        <div className="flex animate-marquee motion-reduce:animate-none gap-x-16 w-max">
          {items.map((tech, idx) => (
            <div
              key={`${tech.name}-${idx}`}
              className="flex items-center gap-3 text-text-secondary/50 hover:text-text-primary transition-colors duration-300"
            >
              <tech.Icon size={20} strokeWidth={1.5} />
              <span className="text-sm font-medium whitespace-nowrap">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
