"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

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
        type="button"
        onClick={onToggle}
        className="group flex w-full items-center justify-between gap-4 py-5 text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="text-[15px] font-medium text-text-primary group-hover:text-purple-400 transition-colors">
          {question}
        </span>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border transition-colors group-hover:border-purple-400/50">
          {isOpen ? (
            <Minus className="h-3.5 w-3.5 text-text-secondary" />
          ) : (
            <Plus className="h-3.5 w-3.5 text-text-secondary" />
          )}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" as const }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-text-secondary">{answer}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/**
 * Standalone FAQ section — extracted from the old PricingFAQ component
 * (which mixed FAQ with payment methods + contact card and felt cluttered).
 * Reuses the same translation keys: pricingFAQ.faq1Question, faq1Answer, etc.
 */
export default function FAQ() {
  const t = useTranslations("pricingFAQ");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-bg-primary py-24">
      <div className="mx-auto max-w-3xl px-6">
        <header className="mb-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-purple-400">
            {t("faqBadge")}
          </span>
          <h2 className="mt-6 font-(family-name:--font-syne) text-3xl font-bold leading-tight text-text-primary md:text-4xl">
            {t("faqHeading")}
          </h2>
        </header>

        <div className="rounded-2xl border border-border bg-bg-secondary px-6">
          {faqKeys.map((key, index) => (
            <AccordionItem
              key={key}
              question={t(`${key}Question`)}
              answer={t(`${key}Answer`)}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
