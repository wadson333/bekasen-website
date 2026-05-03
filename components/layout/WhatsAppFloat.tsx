"use client";

import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { CONTACT } from "@/lib/contact";

export default function WhatsAppFloat() {
  const t = useTranslations("common");

  return (
    <a
      href={CONTACT.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsappAria")}
      className="fixed bottom-24 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-[0_8px_24px_rgba(34,197,94,0.4)] transition-all hover:scale-110 hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-500/30"
    >
      <MessageCircle className="h-6 w-6" strokeWidth={2.2} />
    </a>
  );
}
