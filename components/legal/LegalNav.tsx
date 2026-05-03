import Link from "next/link";
import { ScrollText, ShieldCheck, FileWarning } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

type Active = "privacy" | "terms" | "disclaimer";

const PAGES: { key: Active; href: string; Icon: typeof ScrollText }[] = [
  { key: "privacy", href: "/privacy", Icon: ShieldCheck },
  { key: "terms", href: "/terms", Icon: ScrollText },
  { key: "disclaimer", href: "/disclaimer", Icon: FileWarning },
];

/**
 * Bottom cross-link nav for the 3 legal pages — encourages users to read
 * neighboring documents and provides cohesion across legal/* without each
 * page needing its own bespoke implementation. Reads from the existing
 * `footer.privacy / footer.terms / footer.disclaimer` i18n keys.
 */
export default function LegalNav({ active }: { active: Active }) {
  const t = useTranslations("footer");
  const locale = useLocale();

  return (
    <nav
      aria-label="Legal documents"
      className="mt-16 flex flex-col items-center gap-4 border-t border-border pt-8 sm:flex-row sm:justify-center sm:gap-6"
    >
      <span className="text-xs uppercase tracking-wider text-text-secondary">
        {locale === "fr" ? "Documents légaux" : locale === "ht" ? "Dokiman legal" : locale === "es" ? "Documentos legales" : "Legal documents"}
      </span>
      <ul className="flex flex-wrap items-center gap-2 sm:gap-3">
        {PAGES.map(({ key, href, Icon }) => {
          const isActive = key === active;
          return (
            <li key={key}>
              <Link
                href={`/${locale}${href}`}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "border-purple-500/50 bg-purple-500/10 text-purple-400"
                    : "border-border bg-bg-secondary text-text-secondary hover:border-purple-400 hover:text-purple-400"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
