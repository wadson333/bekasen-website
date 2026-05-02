import "@/app/globals.css";

/**
 * Client dashboard layout — public, locale-free, minimal. Fonts are
 * self-hosted via Fontsource (imported in globals.css). The page itself
 * reads `client_projects.locale` and renders accordingly.
 */
export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-screen bg-bg-primary text-text-primary font-(family-name:--font-inter)">
        {children}
      </body>
    </html>
  );
}
