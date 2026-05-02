import { notFound } from "next/navigation";
import { safeStringEqual } from "@/lib/auth";
import "@/app/globals.css";

// Next.js typed routes generates `Promise<{}>` for compound segments like
// `panel-[uid]`. The runtime still passes `uid`, so we read it via a cast.
type PanelParams = { uid: string };

export default async function PanelLayout(props: LayoutProps<"/panel-[uid]">) {
  const params = (await props.params) as PanelParams;
  const expectedUid = process.env.ADMIN_PANEL_UID?.trim();

  // Defense-in-depth: middleware already 404s on UID mismatch, but if env
  // changes between middleware and render we still 404 here.
  if (!expectedUid || !params.uid || !safeStringEqual(params.uid, expectedUid)) {
    notFound();
  }

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-screen bg-bg-primary text-text-primary font-(family-name:--font-inter)">
        {props.children}
      </body>
    </html>
  );
}
