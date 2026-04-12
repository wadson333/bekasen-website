import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <Link
              href="/"
              className="text-xl font-[family-name:var(--font-syne)] font-bold text-gradient"
            >
              Bekasen
            </Link>
            <p className="text-sm text-text-secondary">{t("tagline")}</p>
          </div>

          <nav>
            <ul className="flex flex-wrap items-center justify-center gap-4">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  {tNav("about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  {tNav("services")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  {tNav("contact")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-text-secondary">
            &copy; {currentYear} Bekasen. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
