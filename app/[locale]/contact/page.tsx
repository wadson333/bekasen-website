"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Send } from "lucide-react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { CONTACT } from "@/lib/contact";

export default function ContactPage() {
  const t = useTranslations("contactPage");
  const { resolvedTheme } = useTheme();

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!resolvedTheme) return;
    (async function () {
      const cal = await getCalApi({});
      cal("ui", {
        theme: resolvedTheme === "dark" ? "dark" : "light",
        styles: { branding: { brandColor: "#6B21A8" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, [resolvedTheme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-bg-primary pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            {t("badge")}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-bold font-(family-name:--font-syne) text-text-primary leading-tight mb-6"
          >
            {t("title")} <span className="text-purple-500">{t("titleAccent")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        <div className="flex flex-col gap-12 lg:gap-24">
          {/* First Block - Cal Widget */}
          <div className="flex flex-col items-center w-full">
            <h2 className="text-3xl lg:text-4xl font-bold font-(family-name:--font-syne) text-text-primary mb-8 text-center">
              {t("bookingTitle")}
            </h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-5xl mx-auto p-4 md:p-6 min-h-160 flex justify-center items-center rounded-3xl border border-border bg-bg-card/50 backdrop-blur-sm"
            >
              <Cal
                key={resolvedTheme}
                calLink={CONTACT.calMain}
                style={{ width: "100%", height: "100%", overflow: "hidden" }}
                config={{ layout: "month_view", theme: (resolvedTheme as "light" | "dark" | "auto") || "dark" }}
              />
            </motion.div>
          </div>

          {/* Second Block - Contact Cards + Slim Contact Form (3 fields) */}
          <div className="flex flex-col items-center w-full">
            <h2 className="text-3xl lg:text-4xl font-bold font-(family-name:--font-syne) text-text-primary mb-8 text-center">
              {t("feedbackTitle")}
            </h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
            >
              {/* Left Column - Contact Cards */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <a
                  href={CONTACT.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-transparent border border-border hover:border-purple-500/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary font-(family-name:--font-syne)">{t("cards.whatsappTitle")}</h3>
                    <p className="text-sm text-text-secondary mt-1">{t("cards.whatsappDesc")}</p>
                  </div>
                </a>

                <a
                  href={CONTACT.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-transparent border border-border hover:border-purple-500/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary font-(family-name:--font-syne)">{t("cards.telegramTitle")}</h3>
                    <p className="text-sm text-text-secondary mt-1">{t("cards.telegramDesc")}</p>
                  </div>
                </a>

                <a
                  href={CONTACT.emailHref}
                  className="group flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-transparent border border-border hover:border-purple-500/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary font-(family-name:--font-syne)">{t("cards.emailTitle")}</h3>
                    <p className="text-sm text-text-secondary mt-1">{t("cards.emailDesc")}</p>
                  </div>
                </a>
              </div>

              {/* Right Column - Slim 3-field Contact Form */}
              <div className="lg:col-span-8 bg-transparent rounded-3xl border border-border p-8 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] z-0 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-6 grow">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="text-sm font-medium text-text-primary pl-1">{t("form.nameLabel")}</label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder={t("form.namePlaceholder")}
                      className="w-full px-5 py-4 rounded-xl bg-bg-primary border border-border focus:border-purple-500 outline-none transition-colors text-text-primary placeholder:text-text-secondary/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="text-sm font-medium text-text-primary pl-1">{t("form.emailLabel")}</label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder={t("form.emailPlaceholder")}
                      className="w-full px-5 py-4 rounded-xl bg-bg-primary border border-border focus:border-purple-500 outline-none transition-colors text-text-primary placeholder:text-text-secondary/50"
                    />
                  </div>

                  <div className="space-y-2 grow flex flex-col pt-1">
                    <label htmlFor="contact-message" className="text-sm font-medium text-text-primary pl-1">{t("form.messageLabel")}</label>
                    <textarea
                      id="contact-message"
                      required
                      placeholder={t("form.messagePlaceholder")}
                      className="w-full h-full px-5 py-4 rounded-xl bg-bg-primary border border-border focus:border-purple-500 outline-none transition-colors text-text-primary placeholder:text-text-secondary/50 resize-none min-h-37.5 lg:min-h-43.75"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                    >
                      {isSubmitting ? t("form.submittingButton") : (
                        <>
                          {t("form.submitButton")}
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
