"use client";

import { useTranslations } from "next-intl";

export default function PrivacyPage() {
  const t = useTranslations("legal");

  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h1 className="mb-4 font-(family-name:--font-syne) text-4xl font-bold text-text-primary">
            {t("privacy.title")}
          </h1>
          <p className="text-text-secondary">
            {t("privacy.lastUpdated")} April 24, 2026
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-text-secondary">
          {/* Introduction */}
          <section>
            <h2 className="mb-4 font-(family-name:--font-syne) text-2xl font-semibold text-text-primary">
              {t("privacy.intro.title")}
            </h2>
            <p>
              {t("privacy.intro.content")}
            </p>
          </section>

          {/* What Data We Collect */}
          <section>
            <h2 className="mb-4 font-(family-name:--font-syne) text-2xl font-semibold text-text-primary">
              {t("privacy.collection.title")}
            </h2>
            <p className="mb-3">{t("privacy.collection.intro")}</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>{t("privacy.collection.contact")}</li>
              <li>{t("privacy.collection.service")}</li>
              <li>{t("privacy.collection.usage")}</li>
              <li>{t("privacy.collection.technical")}</li>
              <li>{t("privacy.collection.communication")}</li>
            </ul>
          </section>

          {/* How We Use Your Data */}
          <section>
            <h2 className="mb-4 font-(family-name:--font-syne) text-2xl font-semibold text-text-primary">
              {t("privacy.usage.title")}
            </h2>
            <p className="mb-3">{t("privacy.usage.intro")}</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>{t("privacy.usage.service")}</li>
              <li>{t("privacy.usage.communication")}</li>
              <li>{t("privacy.usage.improvement")}</li>
              <li>{t("privacy.usage.marketing")}</li>
              <li>{t("privacy.usage.compliance")}</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="mb-4 font-(family-name:--font-syne) text-2xl font-semibold text-text-primary">
              {t("privacy.sharing.title")}
            </h2>
            <p>
              {t("privacy.sharing.content")}
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="mb-4 font-(family-name:--font-syne) text-2xl font-semibold text-text-primary">
              {t("privacy.retention.title")}
            </h2>
            <p>
              {t("privacy.retention.content")}
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="mb-4 font-(family-name:--font-syne) text-2xl font-semibold text-text-primary">
              {t("privacy.rights.title")}
            </h2>
            <p className="mb-3">{t("privacy.rights.intro")}</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>{t("privacy.rights.access")}</li>
              <li>{t("privacy.rights.correction")}</li>
              <li>{t("privacy.rights.deletion")}</li>
              <li>{t("privacy.rights.portability")}</li>
              <li>{t("privacy.rights.objection")}</li>
            </ul>
          </section>

          {/* Security */}
          <section>
            <h2 className="mb-4 font-(family-name:--font-syne) text-2xl font-semibold text-text-primary">
              {t("privacy.security.title")}
            </h2>
            <p>
              {t("privacy.security.content")}
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="mb-4 font-(family-name:--font-syne) text-2xl font-semibold text-text-primary">
              {t("privacy.cookies.title")}
            </h2>
            <p>
              {t("privacy.cookies.content")}
            </p>
          </section>

          {/* AI Chat History */}
          <section>
            <h2 className="mb-4 font-(family-name:--font-syne) text-2xl font-semibold text-text-primary">
              {t("privacy.aiChat.title")}
            </h2>
            <p>
              {t("privacy.aiChat.content")}
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="mb-4 font-(family-name:--font-syne) text-2xl font-semibold text-text-primary">
              {t("privacy.contact.title")}
            </h2>
            <p>
              {t("privacy.contact.content")}
            </p>
            <p className="mt-3">Email: hello@bekasen.com</p>
          </section>

          {/* Disclaimer */}
          <div className="mt-12 p-4 border border-border rounded bg-opacity-50">
            <p className="text-xs text-text-secondary italic">
              {t("privacy.disclaimer")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
