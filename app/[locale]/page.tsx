import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("hero");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-[family-name:var(--font-syne)] font-bold text-gradient">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-xl text-center text-text-secondary text-lg">
        {t("subtitle")}
      </p>
    </main>
  );
}
