"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { getCalApi } from "@calcom/embed-react";

/**
 * Mounted once near the root of the app (in [locale]/layout.tsx). Registers
 * Cal.com namespaces used by `<CalBookingButton>` so any element with the
 * matching `data-cal-namespace` + `data-cal-link` opens the booking popup
 * instead of navigating away to cal.com.
 *
 * Re-runs when the theme flips so the modal swaps between light/dark.
 *
 * Two namespaces are pre-registered:
 *   - "discovery15" → 15-min discovery call (slug: bekasen-ytjx1n/15min)
 *   - "consult30"   → 30-min full consult   (slug: bekasen-ytjx1n/30min)
 */
export default function CalEmbedInit() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;

    (async () => {
      const cal15 = await getCalApi({ namespace: "discovery15" });
      cal15("ui", {
        theme: resolvedTheme === "dark" ? "dark" : "light",
        styles: { branding: { brandColor: "#7c3aed" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });

      const cal30 = await getCalApi({ namespace: "consult30" });
      cal30("ui", {
        theme: resolvedTheme === "dark" ? "dark" : "light",
        styles: { branding: { brandColor: "#7c3aed" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, [resolvedTheme]);

  return null;
}
