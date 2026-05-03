"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { Code2, Pause, Sparkles, Globe, Check, Calendar } from "lucide-react";

type Locale = "fr" | "en" | "ht" | "es";

const COPY: Record<Locale, {
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  cards: { title: string; body: string }[];
}> = {
  fr: {
    eyebrow: "Pourquoi Bekasen",
    title: "Pas de bullshit. Juste",
    titleAccent: "des résultats.",
    subtitle: "Tout ce que les agences traditionnelles vous facturent en options, on l'inclut par défaut.",
    cards: [
      { title: "Code source à vous", body: "Vous restez propriétaire à 100%. Pas de lock-in, pas de licence cachée, pas de surprise." },
      { title: "Pause ou annulation à tout moment", body: "Aucun engagement annuel. Vous arrêtez quand vous voulez, sans frais." },
      { title: "Design 100% sur mesure", body: "Pas de template recyclé. Chaque interface est dessinée pour votre marque." },
      { title: "Disponibilité en direct", body: "Vous voyez nos créneaux ouverts en temps réel. Réservation en 2 clics." },
    ],
  },
  en: {
    eyebrow: "Why Bekasen",
    title: "No bullshit. Just",
    titleAccent: "results.",
    subtitle: "Everything traditional agencies charge as add-ons, we include by default.",
    cards: [
      { title: "Source code is yours", body: "You stay 100% owner. No lock-in, no hidden licenses, no surprises." },
      { title: "Pause or cancel anytime", body: "No yearly commitment. Stop whenever you want, no fees." },
      { title: "100% custom design", body: "No recycled templates. Every interface is drawn for your brand." },
      { title: "Live availability", body: "You see our open slots in real time. Booking in 2 clicks." },
    ],
  },
  ht: {
    eyebrow: "Poukisa Bekasen",
    title: "San bullshit. Sèlman",
    titleAccent: "rezilta.",
    subtitle: "Tout sa ajans tradisyonèl yo fakti kòm opsyon, nou enkli pa default.",
    cards: [
      { title: "Kòd sous a se pou ou", body: "Ou rete pwopriyetè 100%. Pa gen lock-in, pa gen lisans kache, pa gen sipriz." },
      { title: "Pose oswa anile nenpòt lè", body: "Pa gen angajman ane. Ou kanpe lè ou vle, san frè." },
      { title: "Design 100% pèsonalize", body: "Pa gen template resikle. Chak interfas desinen pou mak ou." },
      { title: "Disponiblite an dirèk", body: "Ou wè plas ouvè nou yo an tan reyèl. Rezèvasyon nan 2 klik." },
    ],
  },
  es: {
    eyebrow: "Por qué Bekasen",
    title: "Sin bullshit. Solo",
    titleAccent: "resultados.",
    subtitle: "Todo lo que las agencias tradicionales facturan como extras, nosotros lo incluimos por defecto.",
    cards: [
      { title: "Código tuyo", body: "Eres 100% propietario. Sin lock-in, sin licencias ocultas, sin sorpresas." },
      { title: "Pausa o cancela cuando quieras", body: "Sin compromiso anual. Paras cuando quieres, sin costo." },
      { title: "Diseño 100% a medida", body: "Sin plantillas recicladas. Cada interfaz se diseña para tu marca." },
      { title: "Disponibilidad en vivo", body: "Ves nuestros cupos en tiempo real. Reserva en 2 clics." },
    ],
  },
};

const ICONS = [Code2, Pause, Sparkles, Calendar];

/**
 * BentoBenefits — the "wow" centerpiece of the homepage.
 *
 * Vibrant purple-violet gradient background with 4 asymmetric white cards
 * sitting on top. Each card highlights a key value (source code ownership,
 * cancel anytime, custom design, live availability). Cards have subtle
 * mouse-tracking gradient halo on hover.
 *
 * Reduced-motion safe.
 */
export default function BentoBenefits() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const reduced = useReducedMotion();
  const copy = COPY[locale];

  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      {/* Vibrant purple gradient background */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #6d28d9 0%, #7c3aed 25%, #8b5cf6 50%, #a855f7 75%, #6366f1 100%)",
          }}
        />
        {/* Soft white film overlay (light mode pulls saturation down a touch) */}
        <div className="absolute inset-0 bg-white/5 dark:bg-black/15" />
        {/* Bottom fade into the next section */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg-primary to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg-primary to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <header className="mx-auto mb-14 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md">
            {copy.eyebrow}
          </span>
          <h2 className="mt-6 font-(family-name:--font-syne) text-3xl font-bold leading-tight text-white md:text-5xl">
            {copy.title}{" "}
            <span className="bg-gradient-to-br from-pink-200 via-pink-300 to-amber-200 bg-clip-text text-transparent italic">
              {copy.titleAccent}
            </span>
          </h2>
          <p className="mt-4 text-lg text-white/85">{copy.subtitle}</p>
        </header>

        {/* Asymmetric bento grid: 2 wide on top, 2 wide on bottom */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-5 md:gap-6">
          {copy.cards.map((card, idx) => {
            const Icon = ICONS[idx] ?? Globe;
            // 1st (large), 2nd (small), 3rd (small), 4th (large)
            const span = idx === 0 || idx === 3 ? "md:col-span-3" : "md:col-span-2";

            return (
              <motion.article
                key={card.title}
                initial={reduced ? false : { opacity: 0, y: 30, scale: 0.96 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: idx * 0.08, ease: [0.25, 0.4, 0.25, 1] }}
                className={`${span} group relative overflow-hidden rounded-3xl bg-bg-card p-7 shadow-[0_24px_60px_rgba(124,58,237,0.25)] transition-all hover:-translate-y-1 hover:shadow-[0_32px_80px_rgba(124,58,237,0.35)] md:p-9`}
              >
                {/* Hover halo */}
                <div
                  className="pointer-events-none absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-purple-500/20 opacity-0 blur-3xl transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 transition-colors group-hover:bg-purple-500/15">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-5 font-(family-name:--font-syne) text-xl font-bold text-text-primary md:text-2xl">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary md:text-base">
                    {card.body}
                  </p>

                  {/* Decorative element per-card */}
                  {idx === 0 ? (
                    <div className="mt-6 overflow-hidden rounded-xl border border-border bg-bg-secondary p-4 font-mono text-[10px] leading-relaxed text-text-secondary">
                      <p><span className="text-purple-500">$</span> git clone</p>
                      <p className="text-text-primary">  bekasen-website.git</p>
                      <p className="mt-1 text-emerald-500">✓ Cloned to your repo</p>
                    </div>
                  ) : null}
                  {idx === 1 ? (
                    <ul className="mt-6 space-y-2 text-xs text-text-secondary">
                      {[
                        locale === "fr" ? "Mois en cours" : locale === "ht" ? "Mwa kounye a" : locale === "es" ? "Mes actual" : "This month",
                        locale === "fr" ? "Mois prochain" : locale === "ht" ? "Mwa pwochen" : locale === "es" ? "Próximo mes" : "Next month",
                        locale === "fr" ? "Annuler à tout moment" : locale === "ht" ? "Anile nenpòt lè" : locale === "es" ? "Cancelar cuando sea" : "Cancel anytime",
                      ].map((line, i) => (
                        <li key={line} className="flex items-center gap-2">
                          <Check className={`h-3.5 w-3.5 ${i === 2 ? "text-purple-500" : "text-emerald-500"}`} />
                          <span className={i === 2 ? "font-medium text-text-primary" : ""}>{line}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {idx === 2 ? (
                    <div className="mt-6 grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className="aspect-square rounded-lg"
                          style={{
                            backgroundImage:
                              n === 1
                                ? "linear-gradient(135deg, #a855f7, #6366f1)"
                                : n === 2
                                  ? "linear-gradient(135deg, #f59e0b, #ef4444)"
                                  : "linear-gradient(135deg, #10b981, #06b6d4)",
                          }}
                        />
                      ))}
                    </div>
                  ) : null}
                  {idx === 3 ? (
                    <div className="mt-6 overflow-hidden rounded-xl border border-border bg-bg-secondary">
                      <div className="border-b border-border px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                        {locale === "fr" ? "Demain" : locale === "ht" ? "Demen" : locale === "es" ? "Mañana" : "Tomorrow"}
                      </div>
                      <div className="space-y-1.5 p-3">
                        {["10:00", "10:30", "11:00", "14:00"].map((t) => (
                          <button
                            type="button"
                            key={t}
                            className="flex w-full items-center justify-between rounded-md border border-border bg-bg-card px-3 py-2 text-xs text-text-primary transition-colors hover:border-purple-400 hover:text-purple-500 cursor-pointer"
                          >
                            <span className="inline-flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              {t}
                            </span>
                            <span className="text-text-secondary">15 min</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
