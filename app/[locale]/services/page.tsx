import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Globe, LayoutDashboard, Cpu, Bot, Check } from "lucide-react";
import CalBookingButton from "@/components/CalBookingButton";
import { highlightText } from "@/lib/highlight";

const TITLE_ACCENT: Record<string, string> = {
  fr: "sur mesure",
  en: "Tailored",
  ht: "pèsonalize",
  es: "a medida",
};

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Services",
};

type Locale = "fr" | "en" | "ht" | "es";

type Service = {
  slug: string;
  Icon: typeof Globe;
  startingFromCents: number;
  timeline: Record<Locale, string>;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  features: Record<Locale, string[]>;
  popular?: boolean;
};

const SERVICES: Service[] = [
  {
    slug: "showcase",
    Icon: Globe,
    startingFromCents: 79900,
    timeline: { fr: "5 jours ouvrés", en: "5 business days", ht: "5 jou", es: "5 días" },
    title: {
      fr: "Site vitrine",
      en: "Showcase website",
      ht: "Sit vitrin",
      es: "Sitio vitrina",
    },
    description: {
      fr: "Site premium basé sur template, optimisé SEO, prêt à convertir. Idéal pour PME qui veulent une présence en ligne rapidement.",
      en: "Premium template-based site, SEO-ready, conversion-focused. Built for SMEs who need a presence online fast.",
      ht: "Sit premium ki baze sou template, optimize SEO, pare pou konvèti. Pou PME ki bezwen yon prezans an liy rapid.",
      es: "Sitio premium basado en plantilla, SEO listo, enfocado en conversión. Para pymes que necesitan presencia online rápida.",
    },
    features: {
      fr: [
        "Jusqu'à 5 pages statiques",
        "Design responsive mobile",
        "Formulaire de contact + WhatsApp",
        "SEO de base + sitemap",
        "Code source vous appartient",
      ],
      en: [
        "Up to 5 static pages",
        "Mobile-responsive design",
        "Contact form + WhatsApp",
        "Basic SEO + sitemap",
        "Source code ownership",
      ],
      ht: [
        "Rive nan 5 paj",
        "Design responsive mobil",
        "Fòm kontak + WhatsApp",
        "SEO debaz + sitemap",
        "Kòd sous a se pou ou",
      ],
      es: [
        "Hasta 5 páginas estáticas",
        "Diseño responsive móvil",
        "Formulario contacto + WhatsApp",
        "SEO básico + sitemap",
        "Propiedad del código fuente",
      ],
    },
  },
  {
    slug: "business-cms",
    Icon: LayoutDashboard,
    startingFromCents: 149900,
    timeline: {
      fr: "10 jours ouvrés",
      en: "10 business days",
      ht: "10 jou",
      es: "10 días",
    },
    title: {
      fr: "Site Business + CMS",
      en: "Business website (CMS)",
      ht: "Sit Biznis ak CMS",
      es: "Sitio Negocios (CMS)",
    },
    description: {
      fr: "Site sur mesure avec panneau admin pour publier vos articles, prix et contenus sans toucher au code. Réservation Cal.com + chatbot IA inclus.",
      en: "Custom site with an admin panel to publish posts, prices, and content without touching code. Cal.com booking + AI chatbot included.",
      ht: "Sit pèsonalize ak panèl admin pou pibliye atik, pri ak kontni san touche kòd la. Rezèvasyon Cal.com + chatbot AI ladan.",
      es: "Sitio a medida con panel admin para publicar artículos, precios y contenido sin tocar el código. Reservas Cal.com + chatbot IA incluidos.",
    },
    popular: true,
    features: {
      fr: [
        "Jusqu'à 10 pages avec CMS",
        "Design sur mesure",
        "SEO complet + schema markup",
        "Réservation Cal.com + paiement",
        "Chatbot IA (capture leads)",
        "Jusqu'à 2 langues",
      ],
      en: [
        "Up to 10 pages with CMS",
        "Custom design",
        "Full on-page SEO + schema",
        "Cal.com booking + payment",
        "AI chatbot (lead capture)",
        "Up to 2 languages",
      ],
      ht: [
        "Rive nan 10 paj ak CMS",
        "Design pèsonalize",
        "SEO konplè + schema",
        "Rezèvasyon Cal.com + peman",
        "Chatbot AI (kapti lead)",
        "Rive nan 2 lang",
      ],
      es: [
        "Hasta 10 páginas con CMS",
        "Diseño a medida",
        "SEO completo + schema",
        "Reservas Cal.com + pago",
        "Chatbot IA (captura leads)",
        "Hasta 2 idiomas",
      ],
    },
  },
  {
    slug: "web-app",
    Icon: Cpu,
    startingFromCents: 299900,
    timeline: {
      fr: "15-25 jours ouvrés",
      en: "15-25 business days",
      ht: "15-25 jou",
      es: "15-25 días",
    },
    title: {
      fr: "Application web sur mesure",
      en: "Custom web application",
      ht: "Aplikasyon web pèsonalize",
      es: "Aplicación web a medida",
    },
    description: {
      fr: "Logiciel métier complet : ERP médical, gestion hôtelière, marketplace, plateforme SaaS. Panneau admin + gestion des rôles inclus.",
      en: "Full business software: medical ERP, hotel management, marketplace, SaaS platform. Admin panel + role-based access included.",
      ht: "Lojisyèl konplè: ERP medikal, jesyon otèl, marketplace, platfòm SaaS. Panèl admin + jesyon wòl ladan.",
      es: "Software completo: ERP médico, gestión hotelera, marketplace, plataforma SaaS. Panel admin + roles incluidos.",
    },
    features: {
      fr: [
        "Pages illimitées, architecture sur mesure",
        "Design UI/UX entièrement sur mesure",
        "Panneau admin + gestion des rôles",
        "Intégrations API sur mesure",
        "Jusqu'à 4 langues",
        "Support prioritaire 90 jours",
      ],
      en: [
        "Unlimited pages, custom architecture",
        "Fully custom UI/UX design",
        "Admin panel + role-based access",
        "Custom API integrations",
        "Up to 4 languages",
        "90 days priority support",
      ],
      ht: [
        "Paj san limit, achitekti pèsonalize",
        "Design UI/UX konplètman pèsonalize",
        "Panèl admin + jesyon wòl",
        "Entegrasyon API pèsonalize",
        "Rive nan 4 lang",
        "Sipò prioritè 90 jou",
      ],
      es: [
        "Páginas ilimitadas, arquitectura a medida",
        "Diseño UI/UX totalmente a medida",
        "Panel admin + roles",
        "Integraciones API a medida",
        "Hasta 4 idiomas",
        "Soporte prioritario 90 días",
      ],
    },
  },
  {
    slug: "ai-automation",
    Icon: Bot,
    startingFromCents: 0,
    timeline: { fr: "Sur devis", en: "Custom quote", ht: "Sou devis", es: "Presupuesto" },
    title: {
      fr: "Automatisation IA",
      en: "AI automation",
      ht: "Otomasyon AI",
      es: "Automatización IA",
    },
    description: {
      fr: "Chatbots qualifiants, assistants vocaux, scoring de leads, génération de contenu. Branché sur vos données et vos outils existants.",
      en: "Qualifying chatbots, voice assistants, lead scoring, content generation. Plugged into your data and existing tools.",
      ht: "Chatbot pou kalifye, asistan vokal, scoring lead, jenerasyon kontni. Konekte ak done ou yo.",
      es: "Chatbots calificadores, asistentes de voz, scoring de leads, generación de contenido. Conectado a tus datos.",
    },
    features: {
      fr: [
        "Chatbot lead-qualification (24/7)",
        "Intégration OpenRouter / Claude / GPT",
        "Scoring + routing automatique",
        "Connecteurs API (Slack, email, CRM)",
        "Tableau de bord temps réel",
      ],
      en: [
        "Lead-qualification chatbot (24/7)",
        "OpenRouter / Claude / GPT integration",
        "Auto scoring + routing",
        "API connectors (Slack, email, CRM)",
        "Real-time dashboard",
      ],
      ht: [
        "Chatbot pou kalifye lead (24/7)",
        "Entegrasyon OpenRouter / Claude / GPT",
        "Scoring + routing otomatik",
        "Konektè API (Slack, imel, CRM)",
        "Tablo bòd tan reyèl",
      ],
      es: [
        "Chatbot calificador (24/7)",
        "Integración OpenRouter / Claude / GPT",
        "Scoring + routing automático",
        "Conectores API (Slack, email, CRM)",
        "Panel en tiempo real",
      ],
    },
  },
];

const PAGE_COPY: Record<Locale, { eyebrow: string; title: string; subtitle: string; popularLabel: string; startingFromLabel: string; ctaLabel: string; quoteLabel: string; timelineLabel: string }> = {
  fr: {
    eyebrow: "Services",
    title: "Des solutions sur mesure pour chaque étape de votre croissance",
    subtitle:
      "De la simple vitrine au logiciel métier complet. Chaque projet inclut le code source, l'hébergement initial et 30 à 90 jours de support.",
    popularLabel: "Le plus demandé",
    startingFromLabel: "À partir de",
    ctaLabel: "Démarrer",
    quoteLabel: "Demander un devis",
    timelineLabel: "Délai",
  },
  en: {
    eyebrow: "Services",
    title: "Tailored solutions for every stage of your growth",
    subtitle:
      "From a simple showcase to full business software. Every project ships with source code, initial hosting and 30 to 90 days of support.",
    popularLabel: "Most requested",
    startingFromLabel: "Starting from",
    ctaLabel: "Get started",
    quoteLabel: "Request a quote",
    timelineLabel: "Timeline",
  },
  ht: {
    eyebrow: "Sèvis",
    title: "Solisyon pèsonalize pou chak etap kwasans ou",
    subtitle:
      "Soti nan yon vitrin senp pou rive nan lojisyèl konplè. Chak pwojè vini ak kòd sous, ebèjman inisyal ak 30 a 90 jou sipò.",
    popularLabel: "Pi mande",
    startingFromLabel: "Kòmanse a",
    ctaLabel: "Kòmanse",
    quoteLabel: "Mande yon devis",
    timelineLabel: "Delè",
  },
  es: {
    eyebrow: "Servicios",
    title: "Soluciones a medida para cada etapa de su crecimiento",
    subtitle:
      "Del simple sitio vitrina al software empresarial completo. Cada proyecto incluye código fuente, hosting inicial y 30 a 90 días de soporte.",
    popularLabel: "Más solicitado",
    startingFromLabel: "Desde",
    ctaLabel: "Empezar",
    quoteLabel: "Solicitar presupuesto",
    timelineLabel: "Plazo",
  },
};

function formatPrice(cents: number, locale: Locale): string {
  return (cents / 100).toLocaleString(locale === "en" ? "en-US" : locale === "es" ? "es" : "fr-FR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const copy = PAGE_COPY[locale];

  return (
    <main className="flex-1 px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mx-auto mb-14 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-400">
            {copy.eyebrow}
          </span>
          <h1 className="mt-6 font-(family-name:--font-syne) text-4xl font-bold leading-tight text-text-primary md:text-5xl">
            {highlightText(copy.title, TITLE_ACCENT[locale])}
          </h1>
          <p className="mt-4 text-lg text-text-secondary">{copy.subtitle}</p>
        </header>

        {/* 4 service cards in a 2×2 grid (or 1 col on mobile) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {SERVICES.map((service) => {
            const isCustomQuote = service.startingFromCents === 0;
            const Icon = service.Icon;

            return (
              <article
                key={service.slug}
                className={`relative flex flex-col rounded-2xl border bg-bg-card p-7 transition-all duration-300 ${
                  service.popular
                    ? "border-purple-500 shadow-[0_8px_30px_rgba(124,58,237,0.15)]"
                    : "border-border hover:border-purple-500/40 hover:-translate-y-0.5"
                }`}
              >
                {service.popular ? (
                  <span className="absolute -top-3 left-7 rounded-full bg-purple-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                    {copy.popularLabel}
                  </span>
                ) : null}

                <div className="mb-5 flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      service.popular ? "bg-purple-500/15 text-purple-400" : "bg-bg-secondary text-purple-400"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="font-(family-name:--font-syne) text-2xl font-bold text-text-primary">
                    {service.title[locale]}
                  </h2>
                </div>

                <p className="text-sm leading-relaxed text-text-secondary">
                  {service.description[locale]}
                </p>

                {/* Price + timeline */}
                <div className="mt-6 flex items-end justify-between gap-4 border-y border-border py-5">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-text-secondary opacity-70">
                      {copy.startingFromLabel}
                    </p>
                    <p className="mt-1 font-(family-name:--font-syne) text-3xl font-bold text-text-primary">
                      {isCustomQuote ? copy.quoteLabel : formatPrice(service.startingFromCents, locale)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-text-secondary opacity-70">
                      {copy.timelineLabel}
                    </p>
                    <p className="mt-1 text-sm font-medium text-text-primary">
                      {service.timeline[locale]}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <ul className="mt-6 space-y-2.5">
                  {service.features[locale].map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-purple-500" />
                      <span className="text-text-primary">{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-7">
                  {isCustomQuote ? (
                    <Link
                      href={`/${locale}/contact`}
                      className={`flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-colors cursor-pointer ${
                        service.popular
                          ? "bg-purple-600 text-white hover:bg-purple-500"
                          : "border border-border bg-bg-secondary text-text-primary hover:border-purple-400 hover:text-purple-400"
                      }`}
                    >
                      {copy.quoteLabel}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <CalBookingButton
                      type="consult30"
                      className={`flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-colors cursor-pointer ${
                        service.popular
                          ? "bg-purple-600 text-white hover:bg-purple-500"
                          : "border border-border bg-bg-secondary text-text-primary hover:border-purple-400 hover:text-purple-400"
                      }`}
                    >
                      {copy.ctaLabel}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </CalBookingButton>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-10 text-center">
          <h3 className="font-(family-name:--font-syne) text-2xl font-bold text-text-primary md:text-3xl">
            {locale === "fr"
              ? "Vous ne savez pas quel service vous convient ?"
              : locale === "ht"
                ? "Ou pa konnen ki sèvis ki bon pou ou?"
                : locale === "es"
                  ? "¿No sabe qué servicio le conviene?"
                  : "Not sure which service fits you?"}
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-text-secondary">
            {locale === "fr"
              ? "15 minutes au téléphone et on identifie ensemble la meilleure option pour votre projet — sans engagement."
              : locale === "ht"
                ? "15 minit nan telefòn epi nou jwenn ansanm pi bon opsyon pou pwojè w la — san angajman."
                : locale === "es"
                  ? "15 minutos al teléfono e identificamos juntos la mejor opción para su proyecto — sin compromiso."
                  : "15 minutes on a call and we'll identify the best fit for your project — no commitment."}
          </p>
          <div className="mt-6">
            <CalBookingButton
              type="discovery15"
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-500 cursor-pointer"
            >
              {locale === "fr"
                ? "Réserver un appel gratuit de 15 min"
                : locale === "ht"
                  ? "Rezève yon apèl gratis 15 min"
                  : locale === "es"
                    ? "Reservar llamada gratis de 15 min"
                    : "Book a free 15-min call"}
              <ArrowRight className="h-4 w-4" />
            </CalBookingButton>
          </div>
        </div>
      </div>
    </main>
  );
}
