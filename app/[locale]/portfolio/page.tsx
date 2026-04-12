import type { Metadata } from "next";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "Portfolio",
};

export default function PortfolioPage() {
  const t = useTranslations("portfolio");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-[family-name:var(--font-syne)] font-bold">
        {t("title")}
      </h1>
    </main>
  );
}
