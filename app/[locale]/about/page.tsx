import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Globe, Clock, Wallet } from "lucide-react";
import InitialsAvatar from "@/components/about/InitialsAvatar";
import LinkedinIcon from "@/components/icons/LinkedinIcon";
import { CONTACT, SITE } from "@/lib/contact";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const title = t("title");
  const description = t("description");
  const ogImage = `${SITE.url}/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(description)}`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE.url}/${locale}/about` },
    openGraph: {
      title,
      description,
      url: `${SITE.url}/${locale}/about`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <main className="flex flex-col min-h-screen pt-32">
      {/* Hero */}
      <section className="px-6 pb-12 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-(family-name:--font-syne) font-bold mb-6 text-text-primary">
            {t("hero.title")}
          </h1>
          <p className="text-xl text-text-secondary">
            {t("hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Section 1 — The Agency */}
      <section className="py-16 px-6 bg-bg-secondary border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-(family-name:--font-syne) font-bold mb-6 text-text-primary">
            {t("story.title")}
          </h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-8">
            {t("story.content")}
          </p>

          {/* Diaspora Promise */}
          <div className="mt-12 rounded-3xl border border-purple-500/20 bg-purple-500/5 p-8">
            <h3 className="text-xl md:text-2xl font-(family-name:--font-syne) font-bold mb-6 text-text-primary">
              {t("diasporaPromise.title")}
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <li className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                  <Globe className="h-5 w-5" />
                </span>
                <span className="text-sm text-text-secondary leading-relaxed">{t("diasporaPromise.remote")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                  <Clock className="h-5 w-5" />
                </span>
                <span className="text-sm text-text-secondary leading-relaxed">{t("diasporaPromise.response")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                  <Wallet className="h-5 w-5" />
                </span>
                <span className="text-sm text-text-secondary leading-relaxed">{t("diasporaPromise.pay")}</span>
              </li>
            </ul>
          </div>

          {/* Made with passion line — relocated from footer */}
          <p className="mt-10 text-center text-sm text-text-secondary italic">
            {t("story.passion")}
          </p>
        </div>
      </section>

      {/* Section 2 — The Founder */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
            <InitialsAvatar
              initials="WJ"
              size={192}
              className="shrink-0 shadow-[0_20px_60px_rgba(139,92,246,0.35)]"
            />
            <div>
              <span className="inline-block px-3 py-1 rounded-full border border-border bg-bg-secondary text-xs font-bold mb-4 uppercase tracking-wider text-text-secondary">
                {t("founder.badge")}
              </span>
              <h2 className="text-4xl font-(family-name:--font-syne) font-bold mb-2 text-text-primary">
                {t("founder.name")}
              </h2>
              <p className="text-xl text-text-secondary mb-6">{t("founder.role")}</p>
              <p className="text-lg text-text-primary leading-relaxed mb-6 italic">
                &quot;{t("founder.vision")}&quot;
              </p>
              <p className="text-base text-text-secondary leading-relaxed mb-6">
                {t("founder.bio")}
              </p>
              <a
                href={CONTACT.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#0A66C2] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0a5cb0] transition-colors"
              >
                <LinkedinIcon className="h-4 w-4" />
                LinkedIn — {SITE.founder}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
