import { useTranslations } from "next-intl";

export default function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const t = useTranslations("portfolio");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-[family-name:var(--font-syne)] font-bold">
        {t("detailTitle")}
      </h1>
    </main>
  );
}
