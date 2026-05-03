"use client";

import type { ReactNode } from "react";
import { CONTACT } from "@/lib/contact";

type Variant = "primary" | "ghost" | "minimal";
type Type = "discovery15" | "consult30";

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500 cursor-pointer",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-full border border-border bg-bg-card px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-purple-400 hover:text-purple-400 cursor-pointer",
  minimal:
    "inline-flex items-center justify-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 cursor-pointer",
};

/**
 * Triggers the Cal.com popup overlay instead of navigating away. Requires
 * <CalEmbedInit /> to be mounted somewhere up the tree (already done in
 * app/[locale]/layout.tsx).
 *
 * @param type "discovery15" (15-min) or "consult30" (30-min) — picks the
 *             matching Cal slug + namespace registered by CalEmbedInit.
 * @param variant Visual style. Defaults to "primary" (filled purple pill).
 *
 * Example:
 *   <CalBookingButton type="discovery15">Book a free call</CalBookingButton>
 */
export default function CalBookingButton({
  children,
  type = "discovery15",
  variant = "primary",
  className,
}: {
  children: ReactNode;
  type?: Type;
  variant?: Variant;
  className?: string;
}) {
  const calLink = type === "discovery15" ? CONTACT.cal15 : CONTACT.calMain;
  const namespace = type === "discovery15" ? "discovery15" : "consult30";

  return (
    <button
      type="button"
      data-cal-namespace={namespace}
      data-cal-link={calLink}
      data-cal-config='{"layout":"month_view"}'
      className={className ?? VARIANT_CLASS[variant]}
    >
      {children}
    </button>
  );
}
