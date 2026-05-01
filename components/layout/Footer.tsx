"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
import LinkedinIcon from "@/components/icons/LinkedinIcon";
import { CONTACT } from "@/lib/contact";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="inline-block relative h-6 w-24"
            >
              <Image
                src="/logo-dark-clean.png"
                alt="Bekasen"
                fill
                sizes="96px"
                className="object-contain block dark:hidden"
              />
              <Image
                src="/logo-clean.png"
                alt="Bekasen"
                fill
                sizes="96px"
                className="object-contain hidden dark:block"
              />
            </Link>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              {t("tagline")}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("navTitle")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#services"
                  className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
                >
                  {tNav("services")}
                </Link>
              </li>
              <li>
                <Link
                  href="/#portfolio"
                  className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
                >
                  {tNav("portfolio")}
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
                >
                  {tNav("faq")}
                </Link>
              </li>
              <li>
                <Link
                  href="/#process"
                  className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
                >
                  {tNav("process")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("servicesTitle")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#services"
                  className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
                >
                  {t("serviceWeb")}
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
                >
                  {t("serviceApp")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("contactTitle")}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-purple-400" />
                <a
                  href={CONTACT.emailHref}
                  className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-purple-400" />
                <a
                  href={`tel:+${CONTACT.whatsapp}`}
                  className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
                >
                  {CONTACT.whatsappDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <LinkedinIcon className="h-4 w-4 shrink-0 text-purple-400" />
                <a
                  href={CONTACT.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
                >
                  {t("linkedin")}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                <span className="text-sm text-text-secondary">
                  {t("location")}
                </span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("legalTitle")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
                >
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
                >
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
                >
                  {t("disclaimer")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-border pt-6">
          <span className="inline-flex items-center gap-2 text-xs text-text-secondary">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {t("replyBadge")}
          </span>
          <span className="inline-flex items-center gap-2 text-xs text-text-secondary">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            {t("secureBadge")}
          </span>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-secondary">
            &copy; {currentYear} Bekasen. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
