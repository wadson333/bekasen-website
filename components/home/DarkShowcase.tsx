import { and, asc, eq } from "drizzle-orm";
import { CheckCircle2, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { portfolioProjects } from "@/drizzle/schema";
import { highlightText } from "@/lib/highlight";

type Locale = "fr" | "en" | "ht" | "es";

const COPY: Record<Locale, {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  cta: string;
}> = {
  fr: {
    eyebrow: "Notre promesse",
    title: "Vous voyez chaque écran avant qu'on le code.",
    body: "On commence par un prototype Figma cliquable. Vous validez le design en 1 ou 2 itérations, puis on passe au développement. Pas de mauvaise surprise à la livraison.",
    bullets: [
      "Prototype interactif Figma sous 5 jours",
      "Itérations illimitées sur le design",
      "Validation écran par écran avant le code",
      "Démo live hebdomadaire pendant le dev",
    ],
    cta: "Voir le projet en détail",
  },
  en: {
    eyebrow: "Our promise",
    title: "You see every screen before we code it.",
    body: "We start with a clickable Figma prototype. You validate the design in 1 or 2 iterations, then we move to development. No nasty surprises at delivery.",
    bullets: [
      "Interactive Figma prototype within 5 days",
      "Unlimited design iterations",
      "Screen-by-screen validation before code",
      "Weekly live demo during development",
    ],
    cta: "View project details",
  },
  ht: {
    eyebrow: "Pwomès nou",
    title: "Ou wè chak ekran anvan nou kode l.",
    body: "Nou kòmanse ak yon prototip Figma klikab. Ou valide design la nan 1 oswa 2 iterasyon, epi nou pase nan devlopman. Pa gen move sipriz nan livrezon.",
    bullets: [
      "Prototip Figma entèraktif nan 5 jou",
      "Iterasyon san limit sou design",
      "Validasyon ekran pa ekran anvan kòd",
      "Demo dirèk chak semèn pandan devlopman",
    ],
    cta: "Wè detay pwojè a",
  },
  es: {
    eyebrow: "Nuestra promesa",
    title: "Ves cada pantalla antes de que la codifiquemos.",
    body: "Empezamos con un prototipo Figma clicable. Validas el diseño en 1 o 2 iteraciones, luego pasamos a desarrollo. Sin sorpresas en la entrega.",
    bullets: [
      "Prototipo Figma interactivo en 5 días",
      "Iteraciones de diseño ilimitadas",
      "Validación pantalla por pantalla antes del código",
      "Demo en vivo semanal durante desarrollo",
    ],
    cta: "Ver detalles del proyecto",
  },
};

// Punch word to highlight inside the title (purple→pink gradient).
const TITLE_ACCENT: Record<Locale, string> = {
  fr: "chaque écran",
  en: "every screen",
  ht: "chak ekran",
  es: "cada pantalla",
};

function pickLocale(value: { fr?: string; en?: string; ht?: string; es?: string }, locale: Locale): string {
  return value[locale] || value.en || value.fr || Object.values(value)[0] || "";
}

/**
 * DarkShowcase — dark-themed section that breaks the visual rhythm.
 *
 * Layout:
 *   - Left column: eyebrow + heading + body + 4-bullet checklist + CTA
 *   - Right column: large floating browser-framed product screenshot
 *     of the most recent featured project (DB-driven)
 *
 * Background: near-black with a subtle purple gradient corner glow.
 * Forces near-black even in light mode (intentional rhythm break).
 */
export default async function DarkShowcase({ locale }: { locale: Locale }) {
  let [project] = await db
    .select()
    .from(portfolioProjects)
    .where(and(eq(portfolioProjects.isPublished, true), eq(portfolioProjects.isFeatured, true)))
    .orderBy(asc(portfolioProjects.displayOrder))
    .limit(1);

  if (!project) {
    [project] = await db
      .select()
      .from(portfolioProjects)
      .where(eq(portfolioProjects.isPublished, true))
      .orderBy(asc(portfolioProjects.displayOrder))
      .limit(1);
  }

  if (!project) return null;
  const copy = COPY[locale];
  const projectTitle = pickLocale(project.title, locale);
  const domain = project.demoUrl
    ? project.demoUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : `${project.slug}.bekasen.com`;

  return (
    <section className="relative overflow-hidden bg-[#0a0a0f] py-24 lg:py-32 text-white">
      {/* Corner glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-purple-500/15 blur-3xl" />
        <div className="absolute -bottom-40 left-0 h-[500px] w-[500px] rounded-full bg-indigo-500/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          {/* Left — copy */}
          <div className="lg:col-span-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-300">
              {copy.eyebrow}
            </span>
            <h2 className="mt-6 font-(family-name:--font-syne) text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
              {highlightText(copy.title, TITLE_ACCENT[locale])}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-300 md:text-lg">{copy.body}</p>

            <ul className="mt-8 space-y-3">
              {copy.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-slate-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <Link
              href={`/${locale}/portfolio/${project.slug}`}
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-500 cursor-pointer"
            >
              {copy.cta}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Right — big product mockup */}
          <div className="lg:col-span-7">
            <div className="relative">
              {/* Glow behind the mockup */}
              <div className="absolute -inset-8 rounded-3xl bg-gradient-to-br from-purple-500/20 via-violet-500/10 to-indigo-500/20 blur-2xl" />

              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#13131a] shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 border-b border-white/10 bg-[#1a1a2e] px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-400/80" />
                    <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                  </div>
                  <div className="ml-3 flex-1 truncate">
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-[#0a0a0f] px-3 py-1 text-[11px] text-slate-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="truncate">{domain}</span>
                    </div>
                  </div>
                </div>
                {/* Screenshot */}
                <div className="aspect-[16/10] w-full overflow-hidden bg-[#13131a]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.thumbnailUrl}
                    alt={projectTitle}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Floating chip with project name */}
              <div className="absolute -bottom-4 left-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#13131a] px-4 py-2 text-xs font-medium text-white shadow-xl">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {projectTitle}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
