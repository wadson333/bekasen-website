"use client";

import { useTranslations } from "next-intl";

export default function DisclaimerPage() {
  const t = useTranslations("legal");

  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4 font-[family-name:var(--font-syne)]">
            {t("disclaimer.title")}
          </h1>
          <p className="text-text-secondary">
            {t("disclaimer.lastUpdated")} April 24, 2026
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-text-secondary">
          {/* General Disclaimer */}
          <section>
            <h2 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("disclaimer.general.title")}
            </h2>
            <p>
              {t("disclaimer.general.content")}
            </p>
          </section>

          {/* As-Is Basis */}
          <section>
            <h2 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("disclaimer.asis.title")}
            </h2>
            <p>
              {t("disclaimer.asis.content")}
            </p>
          </section>

          {/* No Warranties */}
          <section>
            <h2 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("disclaimer.warranties.title")}
            </h2>
            <p className="mb-3">{t("disclaimer.warranties.intro")}</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>{t("disclaimer.warranties.availability")}</li>
              <li>{t("disclaimer.warranties.uninterrupted")}</li>
              <li>{t("disclaimer.warranties.accuracy")}</li>
              <li>{t("disclaimer.warranties.third_party")}</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("disclaimer.thirdparty.title")}
            </h2>
            <p>
              {t("disclaimer.thirdparty.content")}
            </p>
          </section>

          {/* Limitation of Damages */}
          <section>
            <h2 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("disclaimer.damages.title")}
            </h2>
            <p>
              {t("disclaimer.damages.content")}
            </p>
          </section>

          {/* External Links */}
          <section>
            <h2 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("disclaimer.links.title")}
            </h2>
            <p>
              {t("disclaimer.links.content")}
            </p>
          </section>

          {/* Professional Advice */}
          <section>
            <h2 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("disclaimer.advice.title")}
            </h2>
            <p>
              {t("disclaimer.advice.content")}
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("disclaimer.changes.title")}
            </h2>
            <p>
              {t("disclaimer.changes.content")}
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("disclaimer.contact.title")}
            </h2>
            <p>
              {t("disclaimer.contact.content")}
            </p>
            <p className="mt-3">Email: hello@bekasen.com</p>
          </section>

          {/* Legal Notice */}
          <div className="mt-12 p-4 border border-border rounded bg-opacity-50">
            <p className="text-xs text-text-secondary italic">
              {t("disclaimer.notice")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
