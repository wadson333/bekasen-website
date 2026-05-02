import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { safeStringEqual } from "@/lib/auth";
import { extractPanelUidFromPath } from "@/lib/panel-uid";
import "@/app/globals.css";

async function readPanelUidFromHeaders(): Promise<string | null> {
  const h = await headers();
  const pathname =
    h.get("x-invoke-path") ??
    h.get("next-url") ??
    h.get("x-pathname") ??
    h.get("referer")?.split("//").slice(1).join("//").replace(/^[^/]*/, "") ??
    "";
  return extractPanelUidFromPath(pathname);
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const expectedUid = process.env.ADMIN_PANEL_UID?.trim();
  const providedUid = await readPanelUidFromHeaders();

  // Layout is defense-in-depth — the proxy middleware already validated the
  // UID before letting the request reach here. If we cannot read the path
  // (some Next.js dev internals omit x-invoke-path), trust the middleware
  // and let the page render. Production middleware blocks bad UIDs first.
  if (expectedUid && providedUid && !safeStringEqual(providedUid, expectedUid)) {
    notFound();
  }

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-screen bg-bg-primary text-text-primary font-(family-name:--font-inter)">
        {children}
      </body>
    </html>
  );
}
