"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { Stethoscope, Hotel, ShoppingBag, Church, GraduationCap, UtensilsCrossed, ArrowUpRight } from "lucide-react";
import { highlightText } from "@/lib/highlight";

const TITLE_ACCENT: Record<string, string> = {
  fr: "le plus besoin",
  en: "need this most",
  ht: "bezwen sa plis",
  es: "más lo necesitan",
};

const sectors = [
  { key: "clinics", Icon: Stethoscope, color: "text-rose-500", bgGlow: "from-rose-500/20" },
  { key: "hotels", Icon: Hotel, color: "text-sky-500", bgGlow: "from-sky-500/20" },
  { key: "shops", Icon: ShoppingBag, color: "text-amber-500", bgGlow: "from-amber-500/20" },
  { key: "churches", Icon: Church, color: "text-violet-500", bgGlow: "from-violet-500/20" },
  { key: "schools", Icon: GraduationCap, color: "text-emerald-500", bgGlow: "from-emerald-500/20" },
  { key: "restaurants", Icon: UtensilsCrossed, color: "text-orange-500", bgGlow: "from-orange-500/20" },
] as const;

const COPY: Record<string, { custom: string; customSub: string; sectors: Record<string, string> }> = {
  fr: {
    custom: "Votre secteur n'est pas listé ?",
    customSub: "On adapte notre processus à n'importe quel métier. Discutons-en.",
    sectors: {
      schools: "Écoles & formation",
      restaurants: "Restaurants & traiteurs",
    },
  },
  en: {
    custom: "Your sector isn't listed?",
    customSub: "We adapt our process to any industry. Let's talk.",
    sectors: {
      schools: "Schools & training",
      restaurants: "Restaurants & catering",
    },
  },
  ht: {
    custom: "Sektè ou pa nan lis?",
    customSub: "Nou adapte pwosesis nou nan nenpòt metye. Ann pale.",
    sectors: {
      schools: "Lekòl ak fòmasyon",
      restaurants: "Restoran ak traiteur",
    },
  },
  es: {
    custom: "¿Tu sector no está listado?",
    customSub: "Adaptamos nuestro proceso a cualquier industria. Hablemos.",
    sectors: {
      schools: "Escuelas & formación",
      restaurants: "Restaurantes & catering",
    },
  },
};

/**
 * ForWho V2 — bento asymmetric grid.
 *
 * 6 sector cards (existing 4 + schools + restaurants) plus a featured
 * "Your sector?" CTA card spanning 2 cols on desktop. Each card has a
 * subtle radial gradient halo in the sector's accent color on hover.
 *
 * Reduced-motion safe.
 */
export default function ForWho() {
  const t = useTranslations("forWho");
  const locale = useLocale();
  const reduced = useReducedMotion();
  const off = !!reduced;
  const copy = COPY[locale] ?? COPY.en!;

  function getSectorLabel(key: string): string {
    if (key === "schools" || key === "restaurants") {
      return copy.sectors[key] ?? key;
    }
    return t(`sectors.${key}`);
  }

  return (
    <section className="relative bg-bg-primary py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <header className="mx-auto mb-14 max-w-2xl text-center">
          <motion.p
            initial={off ? false : { opacity: 0, y: 12 }}
            whileInView={off ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-400"
          >
            {t("eyebrow")}
          </motion.p>
          <motion.h2
            initial={off ? false : { opacity: 0, y: 16 }}
            whileInView={off ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-3 font-(family-name:--font-syne) text-3xl font-bold leading-tight text-text-primary md:text-5xl"
          >
            {highlightText(t("title"), TITLE_ACCENT[locale])}
          </motion.h2>
          <motion.p
            initial={off ? false : { opacity: 0, y: 12 }}
            whileInView={off ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 max-w-2xl mx-auto text-base leading-relaxed text-text-secondary"
          >
            {t("subtitle")}
          </motion.p>
        </header>

        {/* Bento grid: 4 cols on lg+, 6 sectors + 1 featured "Your sector?" card */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
          {sectors.map(({ key, Icon, color, bgGlow }, idx) => (
            <motion.div
              key={key}
              initial={off ? false : { opacity: 0, y: 24, scale: 0.96 }}
              whileInView={off ? undefined : { opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: 0.05 + idx * 0.06 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-bg-card p-6 transition-all hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-[0_16px_40px_rgba(124,58,237,0.10)]"
            >
              {/* Hover halo */}
              <div
                className={`pointer-events-none absolute -inset-x-4 -top-12 h-32 bg-gradient-to-b ${bgGlow} to-transparent opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100`}
                aria-hidden="true"
              />

              <div className="relative flex flex-col items-center gap-3 text-center">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-secondary ${color} transition-transform group-hover:scale-110`}
                >
                  <Icon className="h-7 w-7" strokeWidth={1.8} />
                </div>
                <span className="text-sm font-semibold text-text-primary sm:text-base">
                  {getSectorLabel(key)}
                </span>
              </div>
            </motion.div>
          ))}

          {/* Featured "Your sector?" CTA — spans 2 cols on lg+ */}
          <motion.a
            href={`/${locale}/contact`}
            initial={off ? false : { opacity: 0, y: 24, scale: 0.96 }}
            whileInView={off ? undefined : { opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.05 + sectors.length * 0.06 }}
            className="group relative col-span-2 overflow-hidden rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent p-6 transition-all hover:-translate-y-1 hover:border-purple-500/60 hover:shadow-[0_16px_40px_rgba(124,58,237,0.18)] cursor-pointer"
          >
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <h3 className="font-(family-name:--font-syne) text-base font-bold text-text-primary sm:text-lg">
                {copy.custom}
              </h3>
              <p className="text-xs text-text-secondary sm:text-sm">{copy.customSub}</p>
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-purple-400 group-hover:text-purple-300">
                {locale === "fr" ? "Démarrer une conversation" : locale === "ht" ? "Kòmanse yon konvèsasyon" : locale === "es" ? "Iniciar conversación" : "Start a conversation"}
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </div>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
