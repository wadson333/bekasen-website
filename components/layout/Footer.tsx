import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="inline-block relative h-6 w-24"
            >
              <img
                src="/logo-dark-clean.png"
                alt="Bekasen"
                className="absolute inset-0 h-full w-auto object-contain block dark:hidden"
              />
              <img
                src="/logo-clean.png"
                alt="Bekasen"
                className="absolute inset-0 h-full w-auto object-contain hidden dark:block"
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
                <a
                  href="/#services"
                  className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
                >
                  {tNav("services")}
                </a>
              </li>
              <li>
                <a
                  href="/#portfolio"
                  className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
                >
                  {tNav("portfolio")}
                </a>
              </li>
              <li>
                <a
                  href="/#faq"
                  className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
                >
                  {tNav("faq")}
                </a>
              </li>
              <li>
                <a
                  href="/#process"
                  className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
                >
                  {tNav("process")}
                </a>
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
                <a
                  href="/#services"
                  className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
                >
                  {t("serviceWeb")}
                </a>
              </li>
              <li>
                <a
                  href="/#services"
                  className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
                >
                  {t("serviceApp")}
                </a>
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
                  href="mailto:hello@bekasen.com"
                  className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
                >
                  hello@bekasen.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-purple-400" />
                <a
                  href="tel:+17865550123"
                  className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
                >
                  +1 (786) 555-0123
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
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-secondary">
            &copy; {currentYear} Bekasen. {t("rights")}
          </p>
          <p className="text-xs text-text-secondary">
            {t("madeWith")}
          </p>
        </div>
      </div>
    </footer>
  );
}
