import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, ShieldCheck, Activity, ServerCog } from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { pricingPlans, pricingFeatures } from "@/drizzle/schema";
import CalBookingButton from "@/components/CalBookingButton";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tarifs",
};

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

const CARE_LABELS: Record<Locale, { eyebrow: string; title: string; subtitle: string; ctaLabel: string; perks: { title: string; subtitle: string }[] }> = {
  fr: {
    eyebrow: "Maintenance",
    title: "Gardez votre site rapide, sécurisé et à jour",
    subtitle: "Plan de maintenance mensuel — sans engagement, mettez en pause ou annulez à tout moment.",
    ctaLabel: "S'abonner au plan Care",
    perks: [
      { title: "Sécurité", subtitle: "Patchs sous 48h" },
      { title: "Performance", subtitle: "99.9% uptime" },
      { title: "Tranquillité", subtitle: "Backups quotidiens" },
    ],
  },
  en: {
    eyebrow: "Maintenance",
    title: "Keep your site fast, secure and up-to-date",
    subtitle: "Monthly maintenance plan — no commitment, pause or cancel anytime.",
    ctaLabel: "Subscribe to Care",
    perks: [
      { title: "Security", subtitle: "Patches within 48h" },
      { title: "Performance", subtitle: "99.9% uptime" },
      { title: "Peace of mind", subtitle: "Daily backups" },
    ],
  },
  ht: {
    eyebrow: "Antretyen",
    title: "Kenbe sit ou rapid, an sekirite ak ajou",
    subtitle: "Plan antretyen chak mwa — san angajman, kanpe oswa anile nenpòt lè.",
    ctaLabel: "Abòne nan plan Care",
    perks: [
      { title: "Sekirite", subtitle: "Patch anba 48h" },
      { title: "Pèfòmans", subtitle: "99.9% uptime" },
      { title: "Trankilite", subtitle: "Backups chak jou" },
    ],
  },
  es: {
    eyebrow: "Mantenimiento",
    title: "Mantén tu sitio rápido, seguro y actualizado",
    subtitle: "Plan de mantenimiento mensual — sin compromiso, pausa o cancela cuando quieras.",
    ctaLabel: "Suscribirse al plan Care",
    perks: [
      { title: "Seguridad", subtitle: "Parches en 48h" },
      { title: "Rendimiento", subtitle: "99.9% uptime" },
      { title: "Tranquilidad", subtitle: "Backups diarios" },
    ],
  },
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

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  const careLabels = CARE_LABELS[locale];

  const plans = await db
    .select()
    .from(pricingPlans)
    .where(eq(pricingPlans.isActive, true))
    .orderBy(asc(pricingPlans.displayOrder));

  const features = await db
    .select()
    .from(pricingFeatures)
    .orderBy(asc(pricingFeatures.displayOrder));

  // Split: one-time/custom = "Build" plans (3-card grid), monthly = "Care" plan
  const buildPlans = plans.filter((p) => p.billingType !== "monthly");
  const carePlans = plans.filter((p) => p.billingType === "monthly");
  const careIcons = [ShieldCheck, Activity, ServerCog] as const;

  return (
    <main className="flex-1 px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 text-center">
          <h1 className="font-(family-name:--font-syne) text-4xl font-bold lg:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-text-secondary">{t("subtitle")}</p>
        </header>

        {buildPlans.length === 0 ? (
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
            {buildPlans.map((plan) => {
              const planFeatures = features.filter((f) => f.planId === plan.id);
              const billingLabel = BILLING_LABEL[plan.billingType]?.[locale] ?? "";
              const isCustom = plan.billingType === "custom";

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

        {/* ─── Care / Maintenance section ─── */}
        {carePlans.length > 0 ? (
          <section className="mt-24">
            <header className="mx-auto mb-10 max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                {careLabels.eyebrow}
              </span>
              <h2 className="mt-6 font-(family-name:--font-syne) text-3xl font-bold text-text-primary md:text-4xl">
                {careLabels.title}
              </h2>
              <p className="mt-3 text-text-secondary">{careLabels.subtitle}</p>
            </header>

            {carePlans.map((plan) => {
              const planFeatures = features.filter((f) => f.planId === plan.id);
              const billingLabel = BILLING_LABEL[plan.billingType]?.[locale] ?? "";
              return (
                <article
                  key={plan.id}
                  className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent p-8 md:p-10"
                >
                  <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                    {/* Left — price + perks + CTA */}
                    <div className="lg:col-span-5">
                      <h3 className="font-(family-name:--font-syne) text-2xl font-bold text-text-primary md:text-3xl">
                        {pickLocale(plan.name, locale)}
                      </h3>
                      <p className="mt-2 text-sm text-text-secondary">{pickLocale(plan.description, locale)}</p>

                      <div className="mt-6">
                        <p className="font-(family-name:--font-syne) text-5xl font-bold text-text-primary">
                          {formatPrice(plan.priceUsd, locale)}
                          <span className="ml-2 text-base font-normal text-text-secondary">
                            {billingLabel}
                          </span>
                        </p>
                      </div>

                      <ul className="mt-6 grid grid-cols-3 gap-3">
                        {careLabels.perks.map((perk, i) => {
                          const Icon = careIcons[i] ?? ShieldCheck;
                          return (
                            <li
                              key={perk.title}
                              className="rounded-2xl border border-border bg-bg-card px-3 py-3 text-center"
                            >
                              <Icon className="mx-auto mb-1.5 h-4 w-4 text-emerald-400" />
                              <p className="text-xs font-semibold text-text-primary">{perk.title}</p>
                              <p className="mt-0.5 text-[10px] text-text-secondary">{perk.subtitle}</p>
                            </li>
                          );
                        })}
                      </ul>

                      <CalBookingButton
                        type="consult30"
                        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-400 cursor-pointer sm:w-auto"
                      >
                        {careLabels.ctaLabel}
                      </CalBookingButton>
                    </div>

                    {/* Right — full feature list */}
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
      </div>
    </main>
  );
}
