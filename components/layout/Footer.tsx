"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  ArrowUpRight,
  Send,
  MessageCircle,
} from "lucide-react";
import LinkedinIcon from "@/components/icons/LinkedinIcon";
import InitialsAvatar from "@/components/about/InitialsAvatar";
import CalBookingButton from "@/components/CalBookingButton";
import { CONTACT, SITE } from "@/lib/contact";

const COPY: Record<
  string,
  {
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
    statusOK: string;
    builtBy: string;
    builtByRole: string;
    socialTitle: string;
  }
> = {
  fr: {
    ctaTitle: "Prêt à donner vie à votre projet ?",
    ctaSubtitle: "15 minutes au téléphone, sans engagement, et on voit si on est faits pour travailler ensemble.",
    ctaButton: "Réserver un appel gratuit",
    statusOK: "Tous les systèmes opérationnels",
    builtBy: "Conçu et développé par",
    builtByRole: "Fondateur · Data analyst · Full-stack dev",
    socialTitle: "Suivez-nous",
  },
  en: {
    ctaTitle: "Ready to bring your project to life?",
    ctaSubtitle: "15 minutes on a call, no commitment, and we'll see if we're a fit.",
    ctaButton: "Book a free call",
    statusOK: "All systems operational",
    builtBy: "Designed and built by",
    builtByRole: "Founder · Data analyst · Full-stack dev",
    socialTitle: "Follow us",
  },
  ht: {
    ctaTitle: "Pare pou bay pwojè w lavi?",
    ctaSubtitle: "15 minit nan telefòn, san angajman, epi nou wè si nou ka travay ansanm.",
    ctaButton: "Rezève yon apèl gratis",
    statusOK: "Tout sistèm yo ap mache",
    builtBy: "Konsevwa ak devlope pa",
    builtByRole: "Fondatè · Data analyst · Full-stack dev",
    socialTitle: "Swiv nou",
  },
  es: {
    ctaTitle: "¿Listo para dar vida a tu proyecto?",
    ctaSubtitle: "15 minutos al teléfono, sin compromiso, y vemos si encajamos.",
    ctaButton: "Reservar llamada gratis",
    statusOK: "Todos los sistemas operativos",
    builtBy: "Diseñado y desarrollado por",
    builtByRole: "Fundador · Data analyst · Full-stack dev",
    socialTitle: "Síguenos",
  },
};

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const copy = COPY[locale] ?? COPY.en!;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-border bg-bg-secondary">
      {/* Big watermark "BEKASEN" — very faint, decorative */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 select-none text-center font-(family-name:--font-syne) text-[20vw] font-black leading-[0.8] text-text-primary opacity-[0.025] dark:opacity-[0.04]"
        aria-hidden="true"
      >
        BEKASEN
      </div>

      {/* Soft purple radial top-left */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-purple-500/[0.06] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        {/* ─── Big CTA card ─── */}
        <div className="mb-16 overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/[0.08] via-bg-card to-bg-card p-8 md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
            <div className="max-w-xl">
              <h2 className="font-(family-name:--font-syne) text-2xl font-bold leading-tight text-text-primary md:text-3xl lg:text-4xl">
                {copy.ctaTitle}
              </h2>
              <p className="mt-3 text-sm text-text-secondary md:text-base">
                {copy.ctaSubtitle}
              </p>
            </div>
            <CalBookingButton
              type="discovery15"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-purple-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(124,58,237,0.3)] transition-all hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-[0_12px_40px_rgba(124,58,237,0.4)] cursor-pointer"
            >
              {copy.ctaButton}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </CalBookingButton>
          </div>
        </div>

        {/* ─── Main grid: brand (5 cols) + 3 link cols (7 cols total) ─── */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Brand column */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block relative h-8 w-32">
              <Image
                src="/logo-dark-clean.png"
                alt="Bekasen"
                fill
                sizes="128px"
                className="object-contain block dark:hidden"
              />
              <Image
                src="/logo-clean.png"
                alt="Bekasen"
                fill
                sizes="128px"
                className="object-contain hidden dark:block"
              />
            </Link>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary">
              {t("tagline")}
            </p>

            {/* Status indicator */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {copy.statusOK}
            </div>

            {/* Social row */}
            <div className="mt-8">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                {copy.socialTitle}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={CONTACT.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-card text-text-secondary transition-colors hover:border-[#0A66C2] hover:text-[#0A66C2] cursor-pointer"
                >
                  <LinkedinIcon className="h-4 w-4" />
                </a>
                <a
                  href={CONTACT.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-card text-text-secondary transition-colors hover:border-emerald-500 hover:text-emerald-500 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
                <a
                  href={CONTACT.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-card text-text-secondary transition-colors hover:border-sky-500 hover:text-sky-500 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </a>
                <a
                  href={CONTACT.emailHref}
                  aria-label="Email"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-card text-text-secondary transition-colors hover:border-purple-500 hover:text-purple-500 cursor-pointer"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Pages */}
          <div className="lg:col-span-2">
            <h4 className="mb-4 font-(family-name:--font-syne) text-sm font-semibold text-text-primary">
              {t("navTitle")}
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: tNav("home") },
                { href: "/about", label: tNav("about") },
                { href: "/portfolio", label: tNav("portfolio") },
                { href: "/pricing", label: tNav("pricing") },
                { href: "/blog", label: tNav("blog") },
                { href: "/contact", label: tNav("contact") },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-text-secondary transition-colors hover:text-purple-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h4 className="mb-4 font-(family-name:--font-syne) text-sm font-semibold text-text-primary">
              {t("servicesTitle")}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/services"
                  className="text-sm text-text-secondary transition-colors hover:text-purple-400"
                >
                  {t("serviceWeb")}
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-sm text-text-secondary transition-colors hover:text-purple-400"
                >
                  {t("serviceApp")}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-text-secondary transition-colors hover:text-purple-400"
                >
                  {tNav("pricing")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact + Legal merged */}
          <div className="lg:col-span-3">
            <h4 className="mb-4 font-(family-name:--font-syne) text-sm font-semibold text-text-primary">
              {t("contactTitle")}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={CONTACT.emailHref}
                  className="group inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-purple-400"
                >
                  <Mail className="h-4 w-4 shrink-0 text-purple-400" />
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:+${CONTACT.whatsapp}`}
                  className="group inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-purple-400"
                >
                  <Phone className="h-4 w-4 shrink-0 text-purple-400" />
                  {CONTACT.whatsappDisplay}
                </a>
              </li>
              <li className="inline-flex items-start gap-2 text-sm text-text-secondary">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                {t("location")}
              </li>
            </ul>

            <h4 className="mt-7 mb-3 font-(family-name:--font-syne) text-xs font-semibold uppercase tracking-wider text-text-secondary">
              {t("legalTitle")}
            </h4>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
              <li>
                <Link
                  href="/privacy"
                  className="text-xs text-text-secondary transition-colors hover:text-purple-400"
                >
                  {t("privacy")}
                </Link>
              </li>
              <li className="text-xs text-text-secondary opacity-30">·</li>
              <li>
                <Link
                  href="/terms"
                  className="text-xs text-text-secondary transition-colors hover:text-purple-400"
                >
                  {t("terms")}
                </Link>
              </li>
              <li className="text-xs text-text-secondary opacity-30">·</li>
              <li>
                <Link
                  href="/disclaimer"
                  className="text-xs text-text-secondary transition-colors hover:text-purple-400"
                >
                  {t("disclaimer")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ─── Founder strip ─── */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:gap-6">
          <Link
            href="/about"
            className="group inline-flex items-center gap-3 cursor-pointer"
          >
            <InitialsAvatar initials="WJ" size={40} />
            <div className="text-left">
              <p className="text-[11px] uppercase tracking-wider text-text-secondary">
                {copy.builtBy}
              </p>
              <p className="text-sm font-semibold text-text-primary group-hover:text-purple-400 transition-colors">
                {SITE.founder}
              </p>
            </div>
          </Link>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              {t("secureBadge")}
            </span>
            <span className="hidden h-3 w-px bg-border sm:inline-block" aria-hidden="true" />
            <span className="text-xs text-text-secondary">{t("replyBadge")}</span>
          </div>
        </div>

        {/* ─── Bottom bar ─── */}
        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-text-secondary">
            &copy; {currentYear} Bekasen. {t("rights")}
          </p>
          <p className="text-xs text-text-secondary opacity-70">
            {locale === "fr"
              ? "Fait avec passion en Haïti."
              : locale === "ht"
                ? "Fèt ak pasyon ann Ayiti."
                : locale === "es"
                  ? "Hecho con pasión en Haití."
                  : "Made with passion in Haiti."}
          </p>
        </div>
      </div>
    </footer>
  );
}
