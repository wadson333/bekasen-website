"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock, Calendar, CheckCircle2 } from "lucide-react";
import CalBookingButton from "@/components/CalBookingButton";

const FAUX_SLOTS_BY_LOCALE: Record<string, string[]> = {
  fr: ["Demain · 10:00", "Demain · 14:30", "Mer 6 mai · 11:15", "Jeu 7 mai · 09:00"],
  en: ["Tomorrow · 10:00", "Tomorrow · 14:30", "Wed May 6 · 11:15", "Thu May 7 · 09:00"],
  ht: ["Demen · 10:00", "Demen · 14:30", "Mèkr 6 me · 11:15", "Jed 7 me · 09:00"],
  es: ["Mañana · 10:00", "Mañana · 14:30", "Mié 6 may · 11:15", "Jue 7 may · 09:00"],
};

const COPY: Record<string, { eyebrow: string; perks: string[]; widgetTitle: string; widgetSubtitle: string }> = {
  fr: {
    eyebrow: "Prochain pas",
    perks: ["Sans engagement", "Réponse en moins de 24h", "On répond personnellement, pas un bot"],
    widgetTitle: "Réservez 15 minutes",
    widgetSubtitle: "Choisissez un créneau qui vous arrange",
  },
  en: {
    eyebrow: "Next step",
    perks: ["No commitment", "Reply within 24h", "We answer personally, not a bot"],
    widgetTitle: "Book 15 minutes",
    widgetSubtitle: "Pick a slot that works for you",
  },
  ht: {
    eyebrow: "Pwochen etap",
    perks: ["San angajman", "Repons mwens pase 24h", "Nou reponn an pèsòn, pa yon bot"],
    widgetTitle: "Rezève 15 minit",
    widgetSubtitle: "Chwazi yon plas ki bon pou ou",
  },
  es: {
    eyebrow: "Próximo paso",
    perks: ["Sin compromiso", "Respuesta en 24h", "Respondemos personalmente, no un bot"],
    widgetTitle: "Reserva 15 minutos",
    widgetSubtitle: "Elige un horario que te convenga",
  },
};

/**
 * FinalCTA V2 — split layout (copy + faux Cal slots picker mockup).
 *
 * Replaces the centered version. The faux availability widget on the right
 * builds urgency without loading the actual Cal iframe (one click → real
 * Cal popup overlay opens via CalBookingButton).
 *
 * Reduced-motion safe.
 */
export default function FinalCTA() {
  const t = useTranslations("finalCTA");
  const locale = useLocale();
  const [time, setTime] = useState<string>("");
  const reduced = useReducedMotion();
  const off = !!reduced;
  const slots = FAUX_SLOTS_BY_LOCALE[locale] ?? FAUX_SLOTS_BY_LOCALE.en!;
  const copy = COPY[locale] ?? COPY.en!;

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setTime(formatter.format(now));
    }

    updateClock();
    const interval = setInterval(updateClock, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-bg-primary py-24 lg:py-32"
    >
      {/* Background — subtle radial bottom glow */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute bottom-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2 translate-y-1/4"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(124,58,237,0.10), transparent 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Left — copy */}
          <motion.div
            initial={off ? false : { opacity: 0, y: 20 }}
            whileInView={off ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-400">
              {copy.eyebrow}
            </span>

            <h2 className="mt-6 font-(family-name:--font-syne) text-3xl font-bold leading-tight text-text-primary md:text-5xl">
              {t("title")}
            </h2>

            <p className="mt-4 max-w-xl text-lg text-text-secondary">{t("subtitle")}</p>

            <ul className="mt-8 space-y-3">
              {copy.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2.5 text-sm text-text-primary">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <CalBookingButton
                type="discovery15"
                className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(124,58,237,0.3)] transition-all hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-[0_12px_40px_rgba(124,58,237,0.4)] cursor-pointer"
              >
                {t("cta")}
                <ArrowRight className="h-4 w-4" />
              </CalBookingButton>
              <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                <Clock className="h-3.5 w-3.5 text-purple-400" />
                {t("clockLabel")}{" "}
                <span className="font-mono tabular-nums text-text-primary">
                  {time || "--:--"}
                </span>
              </span>
            </div>
          </motion.div>

          {/* Right — faux Cal slots picker */}
          <motion.div
            initial={off ? false : { opacity: 0, scale: 0.96, y: 20 }}
            whileInView={off ? undefined : { opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="relative">
              {/* Glow behind the widget */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-purple-500/15 via-violet-500/10 to-indigo-500/15 blur-2xl" />

              <div className="relative overflow-hidden rounded-2xl border border-border bg-bg-card shadow-[0_30px_80px_rgba(15,23,42,0.10)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
                {/* Widget header */}
                <div className="border-b border-border bg-bg-secondary px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-500">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-(family-name:--font-syne) text-base font-bold text-text-primary">
                        {copy.widgetTitle}
                      </h3>
                      <p className="text-xs text-text-secondary">{copy.widgetSubtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Faux slots */}
                <div className="space-y-2 p-5">
                  {slots.map((slot, idx) => (
                    <CalBookingButton
                      key={slot}
                      type="discovery15"
                      className={`group flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all cursor-pointer ${
                        idx === 0
                          ? "border-purple-500/50 bg-purple-500/5 text-text-primary hover:border-purple-500 hover:bg-purple-500/10"
                          : "border-border bg-bg-card text-text-primary hover:border-purple-400 hover:bg-purple-500/5"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <span className="relative flex h-2 w-2">
                          {idx === 0 ? (
                            <>
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </>
                          ) : (
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                          )}
                        </span>
                        <span className="font-medium">{slot}</span>
                      </span>
                      <span className="text-xs text-text-secondary opacity-0 transition-opacity group-hover:opacity-100">
                        15 min →
                      </span>
                    </CalBookingButton>
                  ))}
                </div>

                <div className="border-t border-border bg-bg-secondary px-5 py-3 text-center text-[11px] text-text-secondary">
                  {locale === "fr"
                    ? "Plus de créneaux disponibles dans la pop-up"
                    : locale === "ht"
                      ? "Plis plas disponib nan pop-up la"
                      : locale === "es"
                        ? "Más horarios disponibles en el pop-up"
                        : "More slots available in the popup"}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
