"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { saveSelectedLocale } from "@/lib/consent";

const locales = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ht", label: "Kreyòl", flag: "🇭🇹" },
  { code: "es", label: "Español", flag: "🇪🇸" },
] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocaleSelect = (nextLocale: string) => {
    saveSelectedLocale(nextLocale);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-colors cursor-pointer"
        aria-label="Change language"
        aria-expanded={open}
      >
        <Globe size={20} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-border bg-bg-primary/95 backdrop-blur-xl shadow-xl overflow-hidden"
          >
            {locales.map(({ code, label, flag }) => (
              <Link
                key={code}
                href={pathname}
                locale={code}
                onClick={() => handleLocaleSelect(code)}
                className={`flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                  code === locale
                    ? "bg-purple-600/15 text-purple-400 font-medium"
                    : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                }`}
              >
                <span className="text-base">{flag}</span>
                {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
