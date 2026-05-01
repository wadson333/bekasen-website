"use client";

import { useTranslations } from "next-intl";
import { STATS } from "@/lib/stats";

export default function TrustedBy() {
  const t = useTranslations("trustedBy");

  if (STATS.clientCount <= 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 py-6 text-sm text-text-secondary">
      <span className="inline-flex h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
      <span>{t("label", { count: STATS.clientCount })}</span>
    </div>
  );
}
