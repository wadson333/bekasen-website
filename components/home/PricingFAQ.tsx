"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Plus,
  Minus,
  Mail,
  MessageCircle,
} from "lucide-react";

const paymentMethods = [
  { icon: CreditCard, key: "method1" },
  { icon: Banknote, key: "method2" },
  { icon: Smartphone, key: "method3" },
  { icon: Building2, key: "method4" },
] as const;

const faqKeys = ["faq1", "faq2", "faq3", "faq4", "faq5"] as const;

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border/60">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        aria-expanded={isOpen}
      >
        <span className="text-[15px] font-medium text-text-primary group-hover:text-purple-400 transition-colors">
          {question}
        </span>
        <div className="w-7 h-7 rounded-full border border-border flex items-center justify-center flex-shrink-0 transition-colors group-hover:border-purple-400/50">
          {isOpen ? (
            <Minus className="w-3.5 h-3.5 text-text-secondary" />
          ) : (
            <Plus className="w-3.5 h-3.5 text-text-secondary" />
          )}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" as const }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-text-secondary leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PricingFAQ() {
  const t = useTranslations("pricingFAQ");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="pricing" className="relative pt-32 pb-24 bg-bg-secondary">
      {/* Curved top edge */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-bg-primary rounded-b-[40px]" />
      <div className="max-w-6xl mx-auto px-6">
        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column — Heading + Contact Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold tracking-widest text-purple-400 bg-purple-400/10 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              {t("faqBadge")}
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-[42px] font-bold font-[family-name:var(--font-syne)] text-text-primary leading-tight mb-12">
              {t("faqHeading")}
            </h2>

            {/* Contact Card */}
            <div className="rounded-2xl border border-border/60 bg-bg-card/50 p-6 backdrop-blur-sm">
              {/* Avatar + Message */}
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  B
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {t("contactMessage")}
                </p>
              </div>

              {/* Contact Buttons */}
              <div className="space-y-3">
                <a
                  href={`mailto:${t("contactEmail")}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-primary/60 border border-border/40 text-sm text-text-primary hover:border-purple-400/40 transition-colors"
                >
                  <Mail className="w-4 h-4 text-purple-400" />
                  {t("contactEmailLabel")}
                </a>
                <a
                  href={`https://wa.me/${t("contactWhatsapp").replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-primary/60 border border-border/40 text-sm text-text-primary hover:border-green-400/40 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-green-400" />
                  {t("contactWhatsappLabel")}
                </a>
              </div>

              {/* Payment Methods */}
              <div className="mt-6 pt-5 border-t border-border/40">
                <p className="text-xs text-text-secondary mb-3 font-medium tracking-wide uppercase">
                  {t("paymentTitle")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div
                        key={method.key}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-primary/60 border border-border/40 text-xs text-text-secondary"
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {t(method.key)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column — FAQ Accordion */}
          <motion.div
            id="faq"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:pt-16"
          >
            {faqKeys.map((key, index) => (
              <AccordionItem
                key={key}
                question={t(`${key}Question`)}
                answer={t(`${key}Answer`)}
                isOpen={openIndex === index}
                onToggle={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
