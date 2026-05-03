"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { highlightText } from "@/lib/highlight";

const TITLE_ACCENT: Record<string, string> = {
  fr: "les réponses",
  en: "got you",
  ht: "pou ou",
  es: "Te tenemos",
};

type Category = "all" | "pricing" | "process" | "support";

// Map each FAQ key to its category for the filter pills.
const FAQ_KEYS: { key: string; category: Exclude<Category, "all"> }[] = [
  { key: "faq1", category: "process" },   // delivery time
  { key: "faq2", category: "support" },   // post-launch support
  { key: "faq3", category: "process" },   // editing content myself
  { key: "faq4", category: "process" },   // international clients
  { key: "faq5", category: "pricing" },   // payment process
];

const CATEGORY_LABELS: Record<string, Record<Category, string>> = {
  fr: { all: "Toutes", pricing: "Tarifs", process: "Processus", support: "Support" },
  en: { all: "All", pricing: "Pricing", process: "Process", support: "Support" },
  ht: { all: "Tout", pricing: "Pri", process: "Pwosesis", support: "Sipò" },
  es: { all: "Todas", pricing: "Precios", process: "Proceso", support: "Soporte" },
};

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
  reduced,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  reduced: boolean;
}) {
  return (
    <div className="border-b border-border/60 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full items-center justify-between gap-4 py-5 text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="text-[15px] font-medium text-text-primary group-hover:text-purple-400 transition-colors">
          {question}
        </span>
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
            isOpen
              ? "border-purple-400/50 bg-purple-500/10"
              : "border-border group-hover:border-purple-400/50"
          }`}
        >
          {isOpen ? (
            <Minus className="h-3.5 w-3.5 text-purple-400" />
          ) : (
            <Plus className="h-3.5 w-3.5 text-text-secondary" />
          )}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.3, ease: "easeOut" as const }}
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
 * FAQ V2 — accordion with category filter pills.
 *
 * Inspired by Pacivra's tabbed FAQ. Click a pill to filter to a topic;
 * "All" shows every question. The filter doesn't collapse the open
 * accordion — selecting a different category just filters the visible
 * items.
 */
export default function FAQ() {
  const t = useTranslations("pricingFAQ");
  const locale = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const reduced = useReducedMotion() ?? false;
  const labels = CATEGORY_LABELS[locale] ?? CATEGORY_LABELS.en!;

  const visible = FAQ_KEYS.filter(
    (item) => activeCategory === "all" || item.category === activeCategory,
  );

  const categories: Category[] = ["all", "pricing", "process", "support"];

  return (
    <section id="faq" className="bg-bg-primary py-24">
      <div className="mx-auto max-w-3xl px-6">
        <header className="mb-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-purple-400">
            {t("faqBadge")}
          </span>
          <h2 className="mt-6 font-(family-name:--font-syne) text-3xl font-bold leading-tight text-text-primary md:text-4xl">
            {highlightText(t("faqHeading"), TITLE_ACCENT[locale])}
          </h2>
        </header>

        {/* Category filter pills */}
        <div className="mx-auto mb-8 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                aria-pressed={isActive}
                className={`relative rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "text-white"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {isActive ? (
                  <motion.span
                    layoutId="faq-cat-indicator"
                    className="absolute inset-0 -z-10 rounded-full bg-purple-600"
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 350, damping: 30 }
                    }
                  />
                ) : null}
                {labels[cat]}
              </button>
            );
          })}
        </div>

        {/* Accordion */}
        <div className="rounded-2xl border border-border bg-bg-secondary px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
            >
              {visible.length === 0 ? (
                <p className="py-8 text-center text-sm text-text-secondary">
                  {locale === "fr" ? "Aucune question dans cette catégorie." : locale === "ht" ? "Pa gen kesyon nan kategori sa a." : locale === "es" ? "No hay preguntas en esta categoría." : "No questions in this category."}
                </p>
              ) : (
                visible.map((item, idx) => (
                  <AccordionItem
                    key={item.key}
                    question={t(`${item.key}Question`)}
                    answer={t(`${item.key}Answer`)}
                    isOpen={openIndex === idx}
                    onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
                    reduced={reduced}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
