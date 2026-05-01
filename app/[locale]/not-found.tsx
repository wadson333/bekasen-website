import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center bg-bg-primary">
      <div className="relative mb-8 h-12 w-32">
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
      </div>

      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-400">
        {t("eyebrow")}
      </p>
      <h1 className="mt-3 font-(family-name:--font-syne) text-5xl font-bold leading-tight text-text-primary sm:text-6xl">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-xl text-base text-text-secondary leading-relaxed sm:text-lg">
        {t("subtitle")}
      </p>

      <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/"
          className="inline-flex h-12 items-center gap-2 rounded-full bg-purple-600 px-6 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
        >
          {t("backHome")}
        </Link>
        <Link
          href="/contact"
          className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-bg-card px-6 text-sm font-medium text-text-primary hover:border-purple-500/50 transition-colors"
        >
          {t("contactCta")}
        </Link>
      </div>
    </main>
  );
}
