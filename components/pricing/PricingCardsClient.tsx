"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, Loader2, Globe } from "lucide-react";
import CalBookingButton from "@/components/CalBookingButton";
import {
  CURRENCY_OPTIONS,
  convertFromUsdCents,
  fetchRates,
  formatCurrency,
  type CurrencyCode,
  type ExchangeRates,
} from "@/lib/exchange";

type Locale = "fr" | "en" | "ht" | "es";

type Plan = {
  id: string;
  slug: string;
  name: { en?: string; fr?: string; ht?: string; es?: string };
  description: { en?: string; fr?: string; ht?: string; es?: string };
  priceUsd: number;
  priceHtg: number | null;
  priceEur: number | null;
  priceCad: number | null;
  billingType: "one_time" | "monthly" | "custom";
  isPopular: boolean;
};

type Feature = {
  id: string;
  planId: string;
  label: { en?: string; fr?: string; ht?: string; es?: string };
  isIncluded: boolean;
};

type LabelMap<T extends string = string> = Record<Locale, Record<T, string>>;

const BILLING_LABEL: LabelMap<"one_time" | "monthly" | "custom"> = {
  fr: { one_time: "paiement unique", monthly: "/ mois", custom: "sur devis" },
  en: { one_time: "one-time", monthly: "/ month", custom: "custom quote" },
  ht: { one_time: "yon sèl peman", monthly: "/ mwa", custom: "sou devis" },
  es: { one_time: "pago único", monthly: "/ mes", custom: "presupuesto" },
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

const SWITCHER_LABEL: Record<Locale, string> = {
  fr: "Devise",
  en: "Currency",
  ht: "Lajan",
  es: "Moneda",
};

const LIVE_RATE_LABEL: Record<Locale, string> = {
  fr: "Taux en direct",
  en: "Live rate",
  ht: "To dirèk",
  es: "Tasa en vivo",
};

const RATE_DATE_LABEL: Record<Locale, (date: string) => string> = {
  fr: (date) => `Taux ECB du ${date}`,
  en: (date) => `ECB rate from ${date}`,
  ht: (date) => `To ECB ${date}`,
  es: (date) => `Tasa BCE del ${date}`,
};

function pickLocale(value: { fr?: string; en?: string; ht?: string; es?: string }, locale: Locale): string {
  return value[locale] || value.en || value.fr || Object.values(value)[0] || "";
}

/** Get the price for a plan in a given currency. Returns USD cents if unknown. */
function priceFor(
  plan: Plan,
  currency: CurrencyCode,
  rates: ExchangeRates | null,
): { cents: number; isLive: boolean } {
  if (currency === "USD") return { cents: plan.priceUsd, isLive: false };
  if (currency === "HTG" && plan.priceHtg != null) return { cents: plan.priceHtg, isLive: false };
  if (currency === "EUR" && plan.priceEur != null) return { cents: plan.priceEur, isLive: false };
  if (currency === "CAD" && plan.priceCad != null) return { cents: plan.priceCad, isLive: false };
  // Convert from USD via Frankfurter rates
  if (rates) {
    const converted = convertFromUsdCents(plan.priceUsd, currency, rates);
    if (converted != null) return { cents: converted, isLive: true };
  }
  return { cents: plan.priceUsd, isLive: false };
}

export default function PricingCardsClient({
  buildPlans,
  carePlans,
  features,
  locale,
  careCopy,
  emptyCopy,
}: {
  buildPlans: Plan[];
  carePlans: Plan[];
  features: Feature[];
  locale: Locale;
  careCopy: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    perks: { title: string; subtitle: string }[];
  };
  emptyCopy: string;
}) {
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState(false);

  // When user picks an API currency, lazy-fetch rates once
  useEffect(() => {
    const opt = CURRENCY_OPTIONS.find((o) => o.code === currency);
    if (!opt || opt.source !== "api" || rates) return;

    let cancelled = false;
    setRatesLoading(true);
    setRatesError(false);
    fetchRates()
      .then((data) => {
        if (cancelled) return;
        setRates(data);
      })
      .catch(() => {
        if (cancelled) return;
        setRatesError(true);
        setCurrency("USD"); // Fallback
      })
      .finally(() => {
        if (!cancelled) setRatesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currency, rates]);

  const billingLabels = BILLING_LABEL[locale];
  const isApiSourced = CURRENCY_OPTIONS.find((o) => o.code === currency)?.source === "api";

  return (
    <>
      {/* ─── Currency switcher ─── */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-bg-card px-4 py-2 shadow-sm">
          <Globe className="h-3.5 w-3.5 text-purple-400" />
          <span className="text-xs font-medium text-text-secondary">{SWITCHER_LABEL[locale]}:</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="cursor-pointer appearance-none border-none bg-transparent text-sm font-semibold text-text-primary outline-none focus:ring-0"
            aria-label={SWITCHER_LABEL[locale]}
          >
            {CURRENCY_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.flag} {opt.code} — {opt.name}
              </option>
            ))}
          </select>
          {ratesLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" />
          ) : null}
        </div>
        {isApiSourced && rates ? (
          <p className="text-[11px] text-text-secondary opacity-70">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle" />
            <span className="ml-1.5">
              {LIVE_RATE_LABEL[locale]} · {RATE_DATE_LABEL[locale](rates.date)}
            </span>
          </p>
        ) : null}
        {ratesError ? (
          <p className="text-[11px] text-amber-500">
            {locale === "fr"
              ? "Impossible de charger les taux en direct, retour sur USD."
              : locale === "ht"
                ? "Pa ka chaje to a, retounen sou USD."
                : locale === "es"
                  ? "No se pudieron cargar las tasas, volviendo a USD."
                  : "Couldn't load live rates, falling back to USD."}
          </p>
        ) : null}
      </div>

      {/* ─── Build plans (3-card grid) ─── */}
      {buildPlans.length === 0 ? (
        <div className="mx-auto max-w-md rounded-xl border border-dashed border-border bg-bg-secondary px-6 py-12 text-center">
          <p className="text-sm text-text-secondary">{emptyCopy}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {buildPlans.map((plan) => {
            const planFeatures = features.filter((f) => f.planId === plan.id);
            const billingLabel = billingLabels[plan.billingType] ?? "";
            const isCustom = plan.billingType === "custom";
            const { cents, isLive } = priceFor(plan, currency, rates);

            return (
              <article
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-bg-secondary p-6 transition-all duration-300 ${
                  plan.isPopular
                    ? "border-purple-500 shadow-lg shadow-purple-500/10"
                    : "border-border hover:border-purple-500/40 hover:-translate-y-0.5"
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
                    {formatCurrency(cents, currency, locale)}
                    {billingLabel ? (
                      <span className="ml-2 text-sm font-normal text-text-secondary">{billingLabel}</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-[11px] text-text-secondary opacity-70">
                    {currency}
                    {isLive ? (
                      <>
                        {" · "}
                        <span className="text-purple-400">{LIVE_RATE_LABEL[locale]}</span>
                      </>
                    ) : null}
                  </p>
                </div>

                <ul className="mb-6 flex-1 space-y-2.5">
                  {planFeatures.map((f) => (
                    <li key={f.id} className="flex items-start gap-2 text-sm">
                      {f.isIncluded ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary opacity-50" />
                      )}
                      <span className={f.isIncluded ? "text-text-primary" : "text-text-secondary line-through opacity-60"}>
                        {pickLocale(f.label, locale)}
                      </span>
                    </li>
                  ))}
                </ul>

                {isCustom ? (
                  <Link
                    href={`/${locale}/contact`}
                    className={`block w-full rounded-md px-4 py-2.5 text-center text-sm font-medium transition-colors cursor-pointer ${
                      plan.isPopular
                        ? "bg-purple-600 text-white hover:bg-purple-500"
                        : "border border-border bg-bg-card text-text-primary hover:border-purple-400 hover:text-purple-400"
                    }`}
                  >
                    {CUSTOM_CTA_LABEL[locale]}
                  </Link>
                ) : (
                  <CalBookingButton
                    type="consult30"
                    className={`block w-full rounded-md px-4 py-2.5 text-center text-sm font-medium transition-colors cursor-pointer ${
                      plan.isPopular
                        ? "bg-purple-600 text-white hover:bg-purple-500"
                        : "border border-border bg-bg-card text-text-primary hover:border-purple-400 hover:text-purple-400"
                    }`}
                  >
                    {CTA_LABEL[locale]}
                  </CalBookingButton>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* ─── Care plans (Maintenance section) ─── */}
      {carePlans.length > 0 ? (
        <section className="mt-24">
          <header className="mx-auto mb-10 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              {careCopy.eyebrow}
            </span>
            <h2 className="mt-6 font-(family-name:--font-syne) text-3xl font-bold text-text-primary md:text-4xl">
              {careCopy.title}
            </h2>
            <p className="mt-3 text-text-secondary">{careCopy.subtitle}</p>
          </header>

          {carePlans.map((plan) => {
            const planFeatures = features.filter((f) => f.planId === plan.id);
            const billingLabel = billingLabels[plan.billingType] ?? "";
            const { cents, isLive } = priceFor(plan, currency, rates);
            return (
              <article
                key={plan.id}
                className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent p-8 md:p-10"
              >
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                  <div className="lg:col-span-5">
                    <h3 className="font-(family-name:--font-syne) text-2xl font-bold text-text-primary md:text-3xl">
                      {pickLocale(plan.name, locale)}
                    </h3>
                    <p className="mt-2 text-sm text-text-secondary">{pickLocale(plan.description, locale)}</p>

                    <div className="mt-6">
                      <p className="font-(family-name:--font-syne) text-5xl font-bold text-text-primary">
                        {formatCurrency(cents, currency, locale)}
                        <span className="ml-2 text-base font-normal text-text-secondary">{billingLabel}</span>
                      </p>
                      <p className="mt-1 text-[11px] text-text-secondary opacity-70">
                        {currency}
                        {isLive ? (
                          <>
                            {" · "}
                            <span className="text-emerald-500">{LIVE_RATE_LABEL[locale]}</span>
                          </>
                        ) : null}
                      </p>
                    </div>

                    <CalBookingButton
                      type="consult30"
                      className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-400 cursor-pointer sm:w-auto"
                    >
                      {careCopy.ctaLabel}
                    </CalBookingButton>
                  </div>

                  <div className="lg:col-span-7">
                    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {planFeatures.map((f) => (
                        <li key={f.id} className="flex items-start gap-2.5 text-sm">
                          {f.isIncluded ? (
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          ) : (
                            <X className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary opacity-50" />
                          )}
                          <span className={f.isIncluded ? "text-text-primary" : "text-text-secondary line-through opacity-60"}>
                            {pickLocale(f.label, locale)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
    </>
  );
}
