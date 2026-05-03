import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { pricingPlans, pricingFeatures } from "@/drizzle/schema";
import PricingCardsClient from "@/components/pricing/PricingCardsClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tarifs",
};

type Locale = "fr" | "en" | "ht" | "es";

const CARE_COPY: Record<Locale, {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  perks: { title: string; subtitle: string }[];
}> = {
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

const EMPTY_COPY: Record<Locale, string> = {
  fr: "Les tarifs reviennent bientôt — contactez-nous pour un devis personnalisé.",
  en: "Pricing returns soon — contact us for a custom quote.",
  ht: "Pri yo ap retounen byento — kontakte nou pou yon devis pèsonalize.",
  es: "Los precios volverán pronto — contáctenos para un presupuesto personalizado.",
};

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  const careCopy = CARE_COPY[locale];

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

  // Trim to plain JSON for the client component (Date instances etc would
  // throw on serialization).
  const slimPlans = (list: typeof plans) =>
    list.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      priceUsd: p.priceUsd,
      priceHtg: p.priceHtg,
      priceEur: p.priceEur,
      priceCad: p.priceCad,
      billingType: p.billingType as "one_time" | "monthly" | "custom",
      isPopular: p.isPopular,
    }));

  const slimFeatures = features.map((f) => ({
    id: f.id,
    planId: f.planId,
    label: f.label,
    isIncluded: f.isIncluded,
  }));

  return (
    <main className="flex-1 px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t("title")}
          </span>
          <h1 className="mt-6 font-(family-name:--font-syne) text-4xl font-bold leading-tight text-text-primary md:text-5xl">
            <span className="bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent">
              {t("title")}
            </span>
          </h1>
          <p className="mt-3 text-text-secondary">{t("subtitle")}</p>
        </header>

        <PricingCardsClient
          buildPlans={slimPlans(buildPlans)}
          carePlans={slimPlans(carePlans)}
          features={slimFeatures}
          locale={locale}
          careCopy={careCopy}
          emptyCopy={EMPTY_COPY[locale]}
        />
      </div>
    </main>
  );
}
