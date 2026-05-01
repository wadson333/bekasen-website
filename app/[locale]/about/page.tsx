import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import Navbar from "@/components/layout/Navbar";
import { User, Target, Lightbulb, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About | Bekasen",
};

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 text-center bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-[family-name:var(--font-syne)] font-bold mb-6">
            {t("hero.title")}
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            {t("hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">{t("story.title")}</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t("story.content")}
            </p>
          </div>
          <div className="bg-zinc-200 dark:bg-zinc-800 aspect-video rounded-2xl flex items-center justify-center">
            <span className="text-zinc-400 italic">Agency visual placeholder</span>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 px-6 bg-zinc-50 dark:bg-zinc-950 border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-64 h-64 bg-zinc-300 dark:bg-zinc-700 rounded-full flex-shrink-0 flex items-center justify-center text-6xl">
              <User size={120} className="text-zinc-400" />
            </div>
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs font-bold mb-4 uppercase tracking-wider">
                {t("founder.badge")}
              </span>
              <h2 className="text-4xl font-bold mb-2">{t("founder.name")}</h2>
              <p className="text-xl text-zinc-500 mb-6">{t("founder.role")}</p>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6 italic">
                &quot;{t("founder.vision")}&quot;
              </p>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t("founder.bio")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">{t("values.title")}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <Target className="mx-auto mb-4 text-zinc-500" />
              <p className="font-semibold">{t("values.integrity")}</p>
            </div>
            <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <Lightbulb className="mx-auto mb-4 text-zinc-500" />
              <p className="font-semibold">{t("values.innovation")}</p>
            </div>
            <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <Users className="mx-auto mb-4 text-zinc-500" />
              <p className="font-semibold">{t("values.community")}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
