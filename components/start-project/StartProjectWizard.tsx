"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hotel,
  HeartPulse,
  ShoppingCart,
  Church,
  MoreHorizontal,
  Monitor,
  Settings,
  Bot,
  Store,
  Moon,
  Feather,
  Briefcase,
  Send,
  CheckCircle,
  ArrowLeft,
  X,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

interface FormData {
  industry: string;
  services: string[];
  stylePreference: string;
  budget: string;
  name: string;
  email: string;
  whatsapp: string;
  details: string;
}

const INDUSTRY_ICONS: Record<string, React.ReactNode> = {
  hotel: <Hotel className="w-6 h-6" />,
  clinic: <HeartPulse className="w-6 h-6" />,
  ecommerce: <ShoppingCart className="w-6 h-6" />,
  church: <Church className="w-6 h-6" />,
  other: <MoreHorizontal className="w-6 h-6" />,
};

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  showcase: <Monitor className="w-5 h-5" />,
  custom: <Settings className="w-5 h-5" />,
  chatbot: <Bot className="w-5 h-5" />,
  ecommerce: <Store className="w-5 h-5" />,
};

const STYLE_ICONS: Record<string, React.ReactNode> = {
  tech: <Moon className="w-6 h-6" />,
  minimal: <Feather className="w-6 h-6" />,
  corporate: <Briefcase className="w-6 h-6" />,
};

const INDUSTRIES = ["hotel", "clinic", "ecommerce", "church", "other"] as const;
const SERVICES = ["showcase", "custom", "chatbot", "ecommerce"] as const;
const STYLES = ["tech", "minimal", "corporate"] as const;
const BUDGETS = ["500_1000", "1000_3000", "3000_plus"] as const;
const TOTAL_STEPS = 4;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const slideTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export default function StartProjectWizard() {
  const t = useTranslations("startProject");
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    industry: "",
    services: [],
    stylePreference: "",
    budget: "",
    name: "",
    email: "",
    whatsapp: "",
    details: "",
  });

  function goTo(nextStep: number) {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  }

  function selectIndustry(value: string) {
    setFormData((prev) => ({ ...prev, industry: value }));
    goTo(2);
  }

  function toggleService(value: string) {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(value)
        ? prev.services.filter((s) => s !== value)
        : [...prev.services, value],
    }));
  }

  function selectStyle(value: string) {
    setFormData((prev) => ({ ...prev, stylePreference: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log(formData);
    setSubmitted(true);
  }

  const progress = (step / TOTAL_STEPS) * 100;

  if (submitted) {
    return (
      <div className="w-full max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring" as const, stiffness: 260, damping: 20 }}
          className="relative rounded-2xl border border-border bg-bg-card/60 backdrop-blur-xl p-10 text-center shadow-2xl"
        >
          <CheckCircle className="w-16 h-16 text-purple-500 mx-auto mb-6" />
          <h2 className="text-3xl font-[family-name:var(--font-syne)] font-bold text-text-primary mb-4">
            {t("success.title")}
          </h2>
          <p className="text-text-secondary text-lg">
            {t("success.message")}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-6">
      <div className="relative rounded-2xl border border-border bg-bg-card/60 backdrop-blur-xl p-8 md:p-10 shadow-2xl overflow-hidden">
        {/* Close button */}
        <Link
          href="/"
          className="absolute top-4 right-4 p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors z-10"
          aria-label="Close"
        >
          <X size={20} />
        </Link>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-text-secondary mb-2">
            <span>
              {t("progress", { current: step, total: TOTAL_STEPS })}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" as const }}
            />
          </div>
        </div>

        {/* Back button */}
        {step > 1 && (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("back")}
          </button>
        )}

        {/* Steps */}
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
            >
              <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-syne)] font-bold text-text-primary mb-2">
                {t("step1.title")}
              </h2>
              <p className="text-text-secondary mb-8">{t("step1.subtitle")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {INDUSTRIES.map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => selectIndustry(industry)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                      formData.industry === industry
                        ? "border-purple-500 bg-purple-500/10 text-purple-400"
                        : "border-border bg-bg-secondary/50 text-text-primary hover:border-purple-500/50 hover:bg-purple-500/5"
                    }`}
                  >
                    <span className="flex-shrink-0">
                      {INDUSTRY_ICONS[industry]}
                    </span>
                    <span className="font-medium">
                      {t(`step1.industries.${industry}`)}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
            >
              <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-syne)] font-bold text-text-primary mb-2">
                {t("step2.title")}
              </h2>
              <p className="text-text-secondary mb-8">{t("step2.subtitle")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {SERVICES.map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleService(service)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                      formData.services.includes(service)
                        ? "border-purple-500 bg-purple-500/10 text-purple-400"
                        : "border-border bg-bg-secondary/50 text-text-primary hover:border-purple-500/50 hover:bg-purple-500/5"
                    }`}
                  >
                    <span className="flex-shrink-0">
                      {SERVICE_ICONS[service]}
                    </span>
                    <span className="font-medium text-left">
                      {t(`step2.services.${service}`)}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => goTo(3)}
                disabled={formData.services.length === 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:opacity-90"
              >
                {t("continue")}
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
            >
              <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-syne)] font-bold text-text-primary mb-2">
                {t("step3.title")}
              </h2>
              <p className="text-text-secondary mb-8">{t("step3.subtitle")}</p>
              <div className="grid grid-cols-1 gap-4 mb-8">
                {STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => selectStyle(style)}
                    className={`flex items-center gap-4 p-5 rounded-xl border transition-all cursor-pointer ${
                      formData.stylePreference === style
                        ? "border-purple-500 bg-purple-500/10 text-purple-400"
                        : "border-border bg-bg-secondary/50 text-text-primary hover:border-purple-500/50 hover:bg-purple-500/5"
                    }`}
                  >
                    <span className="flex-shrink-0">
                      {STYLE_ICONS[style]}
                    </span>
                    <div className="text-left">
                      <span className="font-semibold block">
                        {t(`step3.styles.${style}.label`)}
                      </span>
                      <span className="text-sm text-text-secondary">
                        {t(`step3.styles.${style}.description`)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => goTo(4)}
                disabled={!formData.stylePreference}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:opacity-90"
              >
                {t("continue")}
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
            >
              <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-syne)] font-bold text-text-primary mb-2">
                {t("step4.title")}
              </h2>
              <p className="text-text-secondary mb-8">{t("step4.subtitle")}</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="wizard-name"
                    className="block text-sm font-medium text-text-secondary mb-1.5"
                  >
                    {t("step4.name")}
                  </label>
                  <input
                    id="wizard-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary/50 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
                    placeholder={t("step4.namePlaceholder")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="wizard-email"
                    className="block text-sm font-medium text-text-secondary mb-1.5"
                  >
                    {t("step4.email")}
                  </label>
                  <input
                    id="wizard-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary/50 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
                    placeholder={t("step4.emailPlaceholder")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="wizard-whatsapp"
                    className="block text-sm font-medium text-text-secondary mb-1.5"
                  >
                    {t("step4.whatsapp")}
                  </label>
                  <input
                    id="wizard-whatsapp"
                    type="tel"
                    required
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        whatsapp: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary/50 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
                    placeholder={t("step4.whatsappPlaceholder")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="wizard-budget"
                    className="block text-sm font-medium text-text-secondary mb-1.5"
                  >
                    {t("step4.budget")}
                  </label>
                  <select
                    id="wizard-budget"
                    required
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        budget: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary/50 text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      {t("step4.budgetPlaceholder")}
                    </option>
                    {BUDGETS.map((budget) => (
                      <option key={budget} value={budget}>
                        {t(`step4.budgets.${budget}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="wizard-details"
                    className="block text-sm font-medium text-text-secondary mb-1.5"
                  >
                    {t("step4.details")}
                  </label>
                  <textarea
                    id="wizard-details"
                    rows={4}
                    value={formData.details}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        details: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary/50 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors resize-none"
                    placeholder={t("step4.detailsPlaceholder")}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <Send className="w-5 h-5" />
                  {t("step4.submit")}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
