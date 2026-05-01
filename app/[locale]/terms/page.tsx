"use client";

import { useTranslations } from "next-intl";

export default function TermsPage() {
  const t = useTranslations("legal");

  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4 font-[family-name:var(--font-syne)]">
            {t("terms.title")}
          </h1>
          <p className="text-text-secondary">
            {t("terms.lastUpdated")} April 24, 2026
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-text-secondary">
          {/* Acceptance */}
          <section>
            <h2 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("terms.acceptance.title")}
            </h2>
            <p>
              {t("terms.acceptance.content")}
            </p>
          </section>

          {/* Services Description */}
          <section>
            <h2 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("terms.services.title")}
            </h2>
            <p>
              {t("terms.services.content")}
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("terms.ip.title")}
            </h2>
            <p className="mb-3">{t("terms.ip.intro")}</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>{t("terms.ip.bekasenContent")}</li>
              <li>{t("terms.ip.clientContent")}</li>
              <li>{t("terms.ip.license")}</li>
            </ul>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("terms.responsibilities.title")}
            </h2>
            <p className="mb-3">{t("terms.responsibilities.intro")}</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>{t("terms.responsibilities.accuracy")}</li>
              <li>{t("terms.responsibilities.compliance")}</li>
              <li>{t("terms.responsibilities.rights")}</li>
              <li>{t("terms.responsibilities.prohibited")}</li>
            </ul>
          </section>

          {/* Payment Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("terms.payment.title")}
            </h2>
            <p>
              {t("terms.payment.content")}
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("terms.liability.title")}
            </h2>
            <p>
              {t("terms.liability.content")}
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("terms.indemnity.title")}
            </h2>
            <p>
              {t("terms.indemnity.content")}
            </p>
          </section>

          {/* Term and Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("terms.termination.title")}
            </h2>
            <p>
              {t("terms.termination.content")}
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("terms.law.title")}
            </h2>
            <p>
              {t("terms.law.content")}
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-syne)] mb-4">
              {t("terms.contact.title")}
            </h2>
            <p>
              {t("terms.contact.content")}
            </p>
            <p className="mt-3">Email: hello@bekasen.com</p>
          </section>

          {/* Disclaimer */}
          <div className="mt-12 p-4 border border-border rounded bg-opacity-50">
            <p className="text-xs text-text-secondary italic">
              {t("terms.disclaimer")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
