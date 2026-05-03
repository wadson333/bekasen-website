import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { pricingPlans, pricingFeatures } from "@/drizzle/schema";
import CalBookingButton from "@/components/CalBookingButton";

type Locale = "fr" | "en" | "ht" | "es";

const BILLING_LABEL: Record<string, Record<Locale, string>> = {
  one_time: { fr: "paiement unique", en: "one-time", ht: "yon sèl peman", es: "pago único" },
  monthly: { fr: "/ mois", en: "/ month", ht: "/ mwa", es: "/ mes" },
  custom: { fr: "sur devis", en: "custom quote", ht: "sou devis", es: "presupuesto" },
};

const POPULAR_LABEL: Record<Locale, string> = {
  fr: "Le plus populaire",
  en: "Most popular",
  ht: "Pi popilè",
  es: "Más popular",
};

const STARTING_FROM: Record<Locale, string> = {
  fr: "À partir de",
  en: "Starting from",
  ht: "Kòmanse a",
  es: "Desde",
};

const SEE_ALL_PLANS: Record<Locale, string> = {
  fr: "Voir tous les détails et fonctionnalités",
  en: "See all details and features",
  ht: "Wè tout detay yo",
  es: "Ver todos los detalles",
};

const CTA_LABEL: Record<Locale, string> = {
  fr: "Démarrer",
  en: "Get started",
  ht: "Kòmanse",
  es: "Empezar",
};

const CUSTOM_CTA_LABEL: Record<Locale, string> = {
  fr: "Demander un devis",
  en: "Request a quote",
  ht: "Mande yon devis",
  es: "Solicitar presupuesto",
};

function pickLocale(value: { fr?: string; en?: string; ht?: string; es?: string }, locale: Locale): string {
  return value[locale] || value.en || value.fr || Object.values(value)[0] || "";
}

function formatPrice(cents: number, locale: Locale): string {
  return (cents / 100).toLocaleString(locale === "en" ? "en-US" : locale === "es" ? "es" : "fr-FR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/**
 * Services / Offer section — server component, reads pricingPlans + features
 * directly from the DB. Replaces the old hardcoded ServicesBento.
 *
 * Layout: 3 equal cards on desktop, stacked on mobile. The plan flagged
 * `is_popular = true` gets the purple frame + "Most popular" pill.
 *
 * Per the design brief: clean spacing (8px grid), max 5 features per card
 * to stay scan-friendly, soft shadow on the popular card only, NO gradient
 * text or decorative pills inside cards.
 */
export default async function ServicesGrid({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "servicesBento" });

  const plans = await db
    .select()
    .from(pricingPlans)
    .where(eq(pricingPlans.isActive, true))
    .orderBy(asc(pricingPlans.displayOrder));

  const features = await db
    .select()
    .from(pricingFeatures)
    .orderBy(asc(pricingFeatures.displayOrder));

  if (plans.length === 0) return null;

  return (
    <section id="services" className="bg-bg-secondary py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <header className="mx-auto mb-14 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-400">
            {t("badge")}
          </span>
          <h2 className="mt-6 font-(family-name:--font-syne) text-3xl font-bold text-text-primary md:text-5xl">
            {t("title")}{" "}
            <span className="text-purple-500">{t("titleAccent")}</span>
          </h2>
          <p className="mt-4 text-lg text-text-secondary">{t("subtitle")}</p>
        </header>

        {/* 3 equal cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {plans.slice(0, 3).map((plan) => {
            const planFeatures = features
              .filter((f) => f.planId === plan.id && f.isIncluded)
              .slice(0, 5);
            const billingLabel = BILLING_LABEL[plan.billingType]?.[locale] ?? "";
            const isCustom = plan.billingType === "custom";

            return (
              <article
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-bg-card p-7 transition-all duration-300 ${
                  plan.isPopular
                    ? "border-purple-500 shadow-[0_8px_30px_rgba(124,58,237,0.15)]"
                    : "border-border hover:border-purple-500/40 hover:-translate-y-0.5"
                }`}
              >
                {plan.isPopular ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                    {POPULAR_LABEL[locale]}
                  </span>
                ) : null}

                <h3 className="font-(family-name:--font-syne) text-xl font-bold text-text-primary">
                  {pickLocale(plan.name, locale)}
                </h3>
                <p className="mt-2 min-h-[3rem] text-sm text-text-secondary line-clamp-2">
                  {pickLocale(plan.description, locale)}
                </p>

                {/* Price */}
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-wider text-text-secondary opacity-70">
                    {STARTING_FROM[locale]}
                  </p>
                  <p className="mt-1 font-(family-name:--font-syne) text-4xl font-bold text-text-primary">
                    {formatPrice(plan.priceUsd, locale)}
                    <span className="ml-2 text-sm font-normal text-text-secondary">
                      {billingLabel}
                    </span>
                  </p>
                </div>

                {/* CTA */}
                <div className="mt-6">
                  {isCustom ? (
                    <Link
                      href={`/${locale}/contact`}
                      className={`flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-colors cursor-pointer ${
                        plan.isPopular
                          ? "bg-purple-600 text-white hover:bg-purple-500"
                          : "border border-border bg-bg-secondary text-text-primary hover:border-purple-400 hover:text-purple-400"
                      }`}
                    >
                      {CUSTOM_CTA_LABEL[locale]}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <CalBookingButton
                      type="consult30"
                      className={`flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-colors cursor-pointer ${
                        plan.isPopular
                          ? "bg-purple-600 text-white hover:bg-purple-500"
                          : "border border-border bg-bg-secondary text-text-primary hover:border-purple-400 hover:text-purple-400"
                      }`}
                    >
                      {CTA_LABEL[locale]}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </CalBookingButton>
                  )}
                </div>

                {/* Features */}
                <ul className="mt-8 space-y-3 border-t border-border pt-6">
                  {planFeatures.map((f) => (
                    <li key={f.id} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-purple-500" />
                      <span className="text-text-primary">{pickLocale(f.label, locale)}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        {/* Link to full pricing */}
        <div className="mt-10 text-center">
          <Link
            href={`/${locale}/pricing`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-400 hover:text-purple-300 cursor-pointer"
          >
            {SEE_ALL_PLANS[locale]} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
