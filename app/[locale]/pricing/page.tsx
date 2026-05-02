import type { Metadata } from "next";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { pricingPlans, pricingFeatures } from "@/drizzle/schema";
import { CONTACT } from "@/lib/contact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tarifs",
};

type Locale = "fr" | "en" | "ht" | "es";

const BILLING_LABEL: Record<string, Record<Locale, string>> = {
  one_time: {
    fr: "paiement unique",
    en: "one-time",
    ht: "yon sèl peman",
    es: "pago único",
  },
  monthly: {
    fr: "/ mois",
    en: "/ month",
    ht: "/ mwa",
    es: "/ mes",
  },
  custom: {
    fr: "sur devis",
    en: "custom quote",
    ht: "sou devis",
    es: "presupuesto",
  },
};

const POPULAR_LABEL: Record<Locale, string> = {
  fr: "Le plus populaire",
  en: "Most popular",
  ht: "Pi popilè",
  es: "Más popular",
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
  const dollars = cents / 100;
  return dollars.toLocaleString(locale === "en" ? "en-US" : locale === "es" ? "es" : "fr-FR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });

  const plans = await db
    .select()
    .from(pricingPlans)
    .where(eq(pricingPlans.isActive, true))
    .orderBy(asc(pricingPlans.displayOrder));

  const features = await db
    .select()
    .from(pricingFeatures)
    .orderBy(asc(pricingFeatures.displayOrder));

  return (
    <main className="flex-1 px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 text-center">
          <h1 className="font-(family-name:--font-syne) text-4xl font-bold lg:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-text-secondary">{t("subtitle")}</p>
        </header>

        {plans.length === 0 ? (
          <div className="mx-auto max-w-md rounded-xl border border-dashed border-border bg-bg-secondary px-6 py-12 text-center">
            <p className="text-sm text-text-secondary">
              {locale === "fr"
                ? "Les tarifs reviennent bientôt — contactez-nous pour un devis personnalisé."
                : locale === "ht"
                  ? "Pri yo ap retounen byento — kontakte nou pou yon devis pèsonalize."
                  : locale === "es"
                    ? "Los precios volverán pronto — contáctenos para un presupuesto personalizado."
                    : "Pricing returns soon — contact us for a custom quote."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const planFeatures = features.filter((f) => f.planId === plan.id);
              const billingLabel = BILLING_LABEL[plan.billingType]?.[locale] ?? "";
              const isCustom = plan.billingType === "custom";

              return (
                <article
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border bg-bg-secondary p-6 ${
                    plan.isPopular ? "border-purple-500 shadow-lg shadow-purple-500/10" : "border-border"
                  }`}
                >
                  {plan.isPopular ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                      {POPULAR_LABEL[locale]}
                    </span>
                  ) : null}

                  <header className="mb-5">
                    <h2 className="font-(family-name:--font-syne) text-2xl font-bold text-text-primary">
                      {pickLocale(plan.name, locale)}
                    </h2>
                    <p className="mt-2 text-sm text-text-secondary line-clamp-3">
                      {pickLocale(plan.description, locale)}
                    </p>
                  </header>

                  <div className="mb-6">
                    <p className="font-(family-name:--font-syne) text-4xl font-bold text-text-primary">
                      {formatPrice(plan.priceUsd, locale)}
                      {billingLabel ? (
                        <span className="ml-2 text-sm font-normal text-text-secondary">{billingLabel}</span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-[11px] text-text-secondary opacity-70">USD</p>
                  </div>

                  <ul className="mb-6 flex-1 space-y-2.5">
                    {planFeatures.map((f) => (
                      <li key={f.id} className="flex items-start gap-2 text-sm">
                        {f.isIncluded ? (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        ) : (
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary opacity-50" />
                        )}
                        <span
                          className={
                            f.isIncluded ? "text-text-primary" : "text-text-secondary line-through opacity-60"
                          }
                        >
                          {pickLocale(f.label, locale)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={isCustom ? `/${locale}/contact` : CONTACT.cal30Href}
                    target={isCustom ? undefined : "_blank"}
                    rel={isCustom ? undefined : "noopener noreferrer"}
                    className={`block w-full rounded-md px-4 py-2.5 text-center text-sm font-medium transition-colors ${
                      plan.isPopular
                        ? "bg-purple-600 text-white hover:bg-purple-500"
                        : "border border-border bg-bg-card text-text-primary hover:border-purple-400 hover:text-purple-400"
                    }`}
                  >
                    {isCustom ? CUSTOM_CTA_LABEL[locale] : CTA_LABEL[locale]}
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
