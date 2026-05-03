"use client";

import { useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";
import LegalNav from "@/components/legal/LegalNav";

export default function DisclaimerPage() {
  const t = useTranslations("legal");

  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <header className="mb-12 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-secondary px-3 py-1 text-xs text-text-secondary">
            <CalendarDays className="h-3.5 w-3.5" />
            {t("disclaimer.lastUpdated")} April 24, 2026
          </span>
          <h1 className="mt-4 font-(family-name:--font-syne) text-4xl font-bold text-text-primary md:text-5xl">
            {t("disclaimer.title")}
          </h1>
        </header>

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
            <p className="mt-3">Email: contact@bekasen.com</p>
          </section>

          {/* Legal Notice */}
          <div className="mt-12 p-4 border border-border rounded bg-opacity-50">
            <p className="text-xs text-text-secondary italic">
              {t("disclaimer.notice")}
            </p>
          </div>
        </div>

        <LegalNav active="disclaimer" />
      </div>
    </main>
  );
}
