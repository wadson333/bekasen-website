"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { useEffect, useCallback } from "react";

interface Project {
  slug: string;
  title: string;
  description: string;
  tags: string[];
}

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export default function QuickViewModal({
  isOpen,
  onClose,
  project,
}: QuickViewModalProps) {
  const t = useTranslations("portfolio");

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal card */}
          <motion.div
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-bg-card p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" as const }}
            role="dialog"
            aria-modal="true"
            aria-label={project.title}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="sticky top-0 float-right z-10 rounded-full p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
              aria-label={t("closeModal")}
            >
              <X size={20} />
            </button>

            {/* Image placeholder */}
            <div className="aspect-video w-full rounded-xl bg-bg-secondary flex items-center justify-center mb-5">
              <span className="text-text-secondary text-sm">
                {t("imagePlaceholder")}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-[family-name:var(--font-syne)] font-bold text-text-primary">
              {project.title}
            </h3>

            {/* Description */}
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              {project.description}
            </p>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA */}
            <Link
              href={`/portfolio/${project.slug}`}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-500 transition-colors cursor-pointer group"
            >
              {t("viewCaseStudy")}
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
