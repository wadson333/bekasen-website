"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Palette,
  Sparkles,
  Search,
  Cpu,
  Plug,
  Headphones,
  Tag,
  Check,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

interface ServicePill {
  key: string;
  icon: LucideIcon;
}

interface ServiceCard {
  titleKey: string;
  descriptionKey: string;
  accentText: string;
  pills: ServicePill[];
}

const services: ServiceCard[] = [
  {
    titleKey: "service1Title",
    descriptionKey: "service1Description",
    accentText: "text-purple-500 dark:text-purple-300",
    pills: [
      { key: "service1Timeline", icon: Clock },
      { key: "service1Price", icon: Tag },
      { key: "service1Feature1", icon: Palette },
      { key: "service1Feature2", icon: Sparkles },
      { key: "service1Feature3", icon: Search },
    ],
  },
  {
    titleKey: "service2Title",
    descriptionKey: "service2Description",
    accentText: "text-indigo-400",
    pills: [
      { key: "service2Timeline", icon: Clock },
      { key: "service2Price", icon: Tag },
      { key: "service2Feature1", icon: Palette },
      { key: "service2Feature2", icon: Sparkles },
      { key: "service2Feature3", icon: Cpu },
    ],
  },
  {
    titleKey: "service3Title",
    descriptionKey: "service3Description",
    accentText: "text-indigo-400",
    pills: [
      { key: "service3Timeline", icon: Clock },
      { key: "service3Price", icon: Tag },
      { key: "service3Feature1", icon: Cpu },
      { key: "service3Feature2", icon: Plug },
      { key: "service3Feature3", icon: Headphones },
    ],
  },
];

function PriceLine({ value, dark }: { value: string; dark: boolean }) {
  return (
    <p
      className={`text-4xl md:text-5xl font-[family-name:var(--font-syne)] font-extrabold leading-none ${
        dark
          ? "bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
          : "bg-gradient-to-r from-purple-500 to-orange-500 bg-clip-text text-transparent"
      }`}
    >
      {value}
      <span className="ml-2 text-base font-medium text-text-secondary">/ monthly</span>
    </p>
  );
}

export default function ServicesBento() {
  const t = useTranslations("servicesBento");
  const topServices = services.slice(0, 2);
  const featuredService = services[2]!;

  return (
    <section className="relative py-24 bg-bg-secondary" id="services">
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-purple-400 uppercase"
          >
            <Zap className="w-3.5 h-3.5" />
            {t("badge")}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-3xl md:text-5xl font-[family-name:var(--font-syne)] font-bold text-text-primary max-w-3xl mx-auto"
          >
            {t("title")}{" "}
            <span className="italic bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              {t("titleAccent")}
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-text-secondary max-w-2xl mx-auto text-lg"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {topServices.map((service, idx) => {
            const priceKey = service.pills.find((pill) => pill.key.includes("Price"))?.key;
            const timelineKey = service.pills.find((pill) => pill.key.includes("Timeline"))?.key;
            const featurePills = service.pills.filter(
              (pill) => !pill.key.includes("Price") && !pill.key.includes("Timeline")
            );

            return (
              <motion.article
                key={service.titleKey}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="rounded-[30px] border border-border bg-bg-primary text-text-primary p-7 md:p-9"
              >
                <h3 className="text-2xl font-[family-name:var(--font-syne)] font-bold">{t(service.titleKey)}</h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {timelineKey ? t(timelineKey) : t(service.descriptionKey)}
                </p>
                <p className="mt-5 text-sm leading-relaxed text-text-secondary">
                  {t(service.descriptionKey)}
                </p>

                <div className="mt-8">{priceKey ? <PriceLine value={t(priceKey)} dark={false} /> : null}</div>

                <p className="mt-4 text-sm font-medium text-text-primary">{t("priceLabel")}</p>

                <Link
                  href="/contact"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors bg-bg-secondary text-text-primary border border-border hover:border-purple-400/40"
                >
                  {t("cta")}
                </Link>

                <div className="mt-8">
                  <p className="text-sm font-semibold text-text-primary">{t("badge")}</p>
                  <ul className="mt-3 space-y-2.5">
                    {featurePills.map((pill) => (
                      <li key={pill.key} className="flex items-start gap-2.5">
                        <Check className={`mt-0.5 w-4 h-4 ${service.accentText}`} />
                        <span className="text-sm text-text-secondary">{t(pill.key)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            );
          })}
        </div>

        <motion.article
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mt-8 rounded-[30px] border border-border bg-bg-primary p-7 md:p-10"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl md:text-3xl font-[family-name:var(--font-syne)] font-bold text-text-primary">
                {t(featuredService.titleKey)}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">{t(featuredService.descriptionKey)}</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-500">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {t("priceLabel")}
            </span>
          </div>

          <div className="mt-7">
            {(() => {
              const priceKey = featuredService.pills.find((pill) => pill.key.includes("Price"))?.key;
              return priceKey ? <PriceLine value={t(priceKey)} dark={false} /> : null;
            })()}
          </div>

          <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {featuredService.pills
              .filter((pill) => !pill.key.includes("Timeline"))
              .map((pill) => {
                const Icon = pill.icon;
                return (
                  <div
                    key={pill.key}
                    className="flex items-center gap-2.5 rounded-full border border-border bg-bg-secondary px-4 py-2.5"
                  >
                    <Icon className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm text-text-secondary">{t(pill.key)}</span>
                  </div>
                );
              })}
          </div>

          <Link
            href="/contact"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-bg-secondary px-5 py-3 text-sm font-semibold text-text-primary hover:border-purple-400/40 transition-colors"
          >
            {t("cta")}
            <ArrowRight size={14} />
          </Link>
        </motion.article>
      </div>
    </section>
  );
}
