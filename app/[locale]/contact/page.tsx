"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Mail, MessageCircle, Send, AlertCircle } from "lucide-react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect, useState, type FormEvent } from "react";
import { useTheme } from "next-themes";
import { CONTACT } from "@/lib/contact";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

export default function ContactPage() {
  const t = useTranslations("contactPage");
  const { resolvedTheme } = useTheme();
  const reduced = useReducedMotion();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submit, setSubmit] = useState<SubmitState>({ status: "idle" });

  useEffect(() => {
    if (!resolvedTheme) return;
    (async function () {
      const cal = await getCalApi({});
      cal("ui", {
        theme: resolvedTheme === "dark" ? "dark" : "light",
        styles: { branding: { brandColor: "#7c3aed" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, [resolvedTheme]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submit.status === "submitting") return;

    setSubmit({ status: "submitting" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          projectType: "website",
        }),
      });

      if (res.ok) {
        setSubmit({ status: "success" });
        setName("");
        setEmail("");
        setMessage("");
        return;
      }

      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      const code = body?.error ?? "unknown";
      const friendlyMap: Record<string, string> = {
        invalid_payload: t("form.errorInvalid"),
        empty_message: t("form.errorEmpty"),
      };
      setSubmit({
        status: "error",
        message: friendlyMap[code] ?? t("form.errorGeneric"),
      });
    } catch {
      setSubmit({ status: "error", message: t("form.errorNetwork") });
    }
  }

  const motionEntry = (delay = 0) =>
    reduced
      ? { initial: false }
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.5 },
        };

  return (
    <main className="min-h-screen bg-bg-primary pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-24">
          <motion.div
            {...motionEntry(0)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            {t("badge")}
          </motion.div>

          <motion.h1
            {...motionEntry(0.1)}
            className="text-5xl lg:text-7xl font-bold font-(family-name:--font-syne) text-text-primary leading-tight mb-6"
          >
            {t("title")} <span className="text-purple-500">{t("titleAccent")}</span>
          </motion.h1>

          <motion.p
            {...motionEntry(0.2)}
            className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        <div className="flex flex-col gap-12 lg:gap-24">
          {/* Cal Widget */}
          <div className="flex flex-col items-center w-full">
            <h2 className="text-3xl lg:text-4xl font-bold font-(family-name:--font-syne) text-text-primary mb-8 text-center">
              {t("bookingTitle")}
            </h2>
            <motion.div
              {...motionEntry(0)}
              transition={{ duration: 0.6 }}
              className="w-full max-w-5xl mx-auto p-4 md:p-6 min-h-160 flex justify-center items-center rounded-3xl border border-border bg-bg-card/50 backdrop-blur-sm"
            >
              <Cal
                key={resolvedTheme}
                calLink={CONTACT.calMain}
                style={{ width: "100%", height: "100%", overflow: "hidden" }}
                config={{
                  layout: "month_view",
                  theme: (resolvedTheme as "light" | "dark" | "auto") || "dark",
                }}
              />
            </motion.div>
          </div>

          {/* Cards + Form */}
          <div className="flex flex-col items-center w-full">
            <h2 className="text-3xl lg:text-4xl font-bold font-(family-name:--font-syne) text-text-primary mb-8 text-center">
              {t("feedbackTitle")}
            </h2>
            <motion.div
              {...motionEntry(0.2)}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
            >
              {/* Cards */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <a
                  href={CONTACT.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-transparent border border-border hover:border-purple-500/50 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 transition-colors group-hover:bg-green-500/20">
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
                  className="group flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-transparent border border-border hover:border-purple-500/50 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 transition-colors group-hover:bg-blue-500/20">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary font-(family-name:--font-syne)">{t("cards.telegramTitle")}</h3>
                    <p className="text-sm text-text-secondary mt-1">{t("cards.telegramDesc")}</p>
                  </div>
                </a>

                <a
                  href={CONTACT.emailHref}
                  className="group flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-transparent border border-border hover:border-purple-500/50 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 transition-colors group-hover:bg-purple-500/20">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary font-(family-name:--font-syne)">{t("cards.emailTitle")}</h3>
                    <p className="text-sm text-text-secondary mt-1">{t("cards.emailDesc")}</p>
                  </div>
                </a>
              </div>

              {/* Form */}
              <div className="lg:col-span-8 bg-transparent rounded-3xl border border-border p-8 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] z-0 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                {submit.status === "success" ? (
                  <div className="relative z-10 flex flex-col items-center justify-center gap-4 py-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="font-(family-name:--font-syne) text-xl font-bold text-text-primary">
                      {t("form.successTitle")}
                    </h3>
                    <p className="max-w-md text-sm text-text-secondary">
                      {t("form.successMessage")}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmit({ status: "idle" })}
                      className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-bg-secondary px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-purple-400 hover:text-purple-400 cursor-pointer"
                    >
                      {t("form.sendAnother")}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-6 grow">
                    <div className="space-y-2">
                      <label htmlFor="contact-name" className="text-sm font-medium text-text-primary pl-1">
                        {t("form.nameLabel")}
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        minLength={1}
                        maxLength={255}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("form.namePlaceholder")}
                        className="w-full px-5 py-4 rounded-xl bg-bg-primary border border-border focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-colors text-text-primary placeholder:text-text-secondary/60"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="contact-email" className="text-sm font-medium text-text-primary pl-1">
                        {t("form.emailLabel")}
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        maxLength={255}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("form.emailPlaceholder")}
                        className="w-full px-5 py-4 rounded-xl bg-bg-primary border border-border focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-colors text-text-primary placeholder:text-text-secondary/60"
                      />
                    </div>

                    <div className="space-y-2 grow flex flex-col pt-1">
                      <label htmlFor="contact-message" className="text-sm font-medium text-text-primary pl-1">
                        {t("form.messageLabel")}
                      </label>
                      <textarea
                        id="contact-message"
                        required
                        minLength={1}
                        maxLength={2000}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t("form.messagePlaceholder")}
                        className="w-full h-full px-5 py-4 rounded-xl bg-bg-primary border border-border focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-colors text-text-primary placeholder:text-text-secondary/60 resize-none min-h-37.5 lg:min-h-43.75"
                      />
                    </div>

                    {submit.status === "error" ? (
                      <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>{submit.message}</p>
                      </div>
                    ) : null}

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submit.status === "submitting"}
                        className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
                      >
                        {submit.status === "submitting" ? (
                          t("form.submittingButton")
                        ) : (
                          <>
                            {t("form.submitButton")}
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
