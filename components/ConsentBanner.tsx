"use client";

import { useSyncExternalStore, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Settings, X } from "lucide-react";
import {
  clearConsentPreferences,
  readConsentPreferences,
  saveConsentPreferences,
  subscribeToConsent,
  type ConsentPreferences,
} from "@/lib/consent";
import { clearLocalChatHistory } from "@/lib/chat-history";

export default function ConsentBanner() {
  const t = useTranslations("consent");
  
  const consent = useSyncExternalStore(
    subscribeToConsent,
    readConsentPreferences,
    () => null
  );

  const [isOpen, setIsOpen] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const [aiChat, setAiChat] = useState(false);

  // Sync internal state with external consent when it changes
  useEffect(() => {
    if (consent) {
      setPreferences(consent.preferences);
      setAiChat(consent.aiChat);
    } else {
      setPreferences(false);
      setAiChat(false);
    }
    
    // Auto-open if no consent
    if (consent === null) {
      setIsOpen(true);
    }
  }, [consent]);

  const persistConsent = (nextPreferences: boolean, nextAiChat: boolean) => {
    saveConsentPreferences({ preferences: true, aiChat: nextAiChat });
    setPreferences(true);
    setAiChat(nextAiChat);
    setIsOpen(false);
    setShowCustomize(false);

    if (!nextAiChat) {
      clearLocalChatHistory();
      fetch("/api/chat/session", { method: "DELETE" }).catch(() => undefined);
    }
  };

  const rejectAll = () => {
    clearLocalChatHistory();
    clearConsentPreferences();
    fetch("/api/chat/session", { method: "DELETE" }).catch(() => undefined);
    saveConsentPreferences({ preferences: true, aiChat: false });
    setPreferences(true);
    setAiChat(false);
    setIsOpen(false);
    setShowCustomize(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="fixed inset-x-4 bottom-4 z-70 mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-bg-card text-text-primary shadow-2xl md:bottom-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-title"
          >
            <div className="p-5 md:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/12 text-purple-400">
                  <Cookie className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 id="consent-title" className="font-(family-name:--font-syne) text-lg font-bold">
                        {t("title")}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                        {t("description")}
                      </p>
                    </div>
                    {consent ? (
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="rounded-full p-1.5 text-text-secondary transition hover:bg-bg-secondary hover:text-text-primary"
                        aria-label={t("close")}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>

                  {showCustomize ? (
                    <div className="mt-5 space-y-3 rounded-xl border border-border bg-bg-primary p-4">
                      <label className="flex items-start gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={preferences}
                          onChange={(event) => setPreferences(event.target.checked)}
                          className="mt-1 h-4 w-4 accent-purple-600"
                        />
                        <span>
                          <span className="block font-medium text-text-primary">{t("preferencesTitle")}</span>
                          <span className="block text-text-secondary">{t("preferencesDescription")}</span>
                        </span>
                      </label>
                      <label className="flex items-start gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={aiChat}
                          onChange={(event) => setAiChat(event.target.checked)}
                          className="mt-1 h-4 w-4 accent-purple-600"
                        />
                        <span>
                          <span className="block font-medium text-text-primary">{t("aiChatTitle")}</span>
                          <span className="block text-text-secondary">{t("aiChatDescription")}</span>
                        </span>
                      </label>
                    </div>
                  ) : null}

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                    <button
                      type="button"
                      onClick={rejectAll}
                      className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-bg-secondary hover:text-text-primary"
                    >
                      {t("rejectAll")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomize((current) => !current)}
                      className="rounded-full border border-purple-400/25 px-4 py-2 text-sm font-medium text-purple-400 transition hover:bg-purple-500/10"
                    >
                      {showCustomize ? t("hideCustomize") : t("customize")}
                    </button>
                    <button
                      type="button"
                      onClick={() => persistConsent(showCustomize ? preferences : true, showCustomize ? aiChat : true)}
                      className="rounded-full bg-linear-to-r from-purple-700 to-indigo-700 px-5 py-2 text-sm font-semibold text-white transition hover:from-purple-600 hover:to-indigo-600"
                    >
                      {showCustomize ? t("saveChoices") : t("acceptAll")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {consent && !isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 left-4 z-60 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-card text-text-secondary shadow-lg transition hover:bg-bg-secondary hover:text-text-primary"
          aria-label={t("manage")}
        >
          <Settings className="h-4 w-4" />
        </button>
      ) : null}
    </>
  );
}
