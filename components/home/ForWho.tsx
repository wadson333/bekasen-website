"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Stethoscope, Hotel, ShoppingBag, Church } from "lucide-react";

const sectors = [
  { key: "clinics", Icon: Stethoscope, color: "text-rose-400" },
  { key: "hotels", Icon: Hotel, color: "text-sky-400" },
  { key: "shops", Icon: ShoppingBag, color: "text-amber-400" },
  { key: "churches", Icon: Church, color: "text-violet-400" },
] as const;

export default function ForWho() {
  const t = useTranslations("forWho");

  return (
    <section className="relative py-20 px-6">
      <div className="mx-auto max-w-5xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-400"
        >
          {t("eyebrow")}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-3 font-(family-name:--font-syne) text-3xl font-bold leading-tight text-text-primary sm:text-4xl lg:text-5xl"
        >
          {t("title")}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 max-w-2xl mx-auto text-base text-text-secondary leading-relaxed"
        >
          {t("subtitle")}
        </motion.p>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {sectors.map(({ key, Icon, color }, idx) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: 0.15 + idx * 0.08 }}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-purple-500/40 hover:bg-bg-card"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-primary/60 ${color} transition-transform group-hover:scale-110`}>
                <Icon className="h-7 w-7" strokeWidth={1.8} />
              </div>
              <span className="text-sm font-semibold text-text-primary sm:text-base">
                {t(`sectors.${key}`)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
