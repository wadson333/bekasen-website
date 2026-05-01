import type { Metadata } from "next";
import { Syne, Inter, Playfair_Display } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import ChatBot from "@/components/ChatBot";
import ConsentBanner from "@/components/ConsentBanner";
import ThemeProviderClient from "@/components/ui/ThemeProviderClient";
import { SITE } from "@/lib/contact";
import "@/app/globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });
  const tAbout = await getTranslations({ locale, namespace: "about" });

  const title = "Bekasen";
  const description = tAbout("description");

  const localeAlternates: Record<string, string> = {};
  for (const l of SITE.locales) {
    localeAlternates[l] = `${SITE.url}/${l}`;
  }
  localeAlternates["x-default"] = `${SITE.url}/${SITE.defaultLocale}`;

  const ogImage = `${SITE.url}/api/og?title=${encodeURIComponent(t("headline"))}`;

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: title,
      template: "%s | Bekasen",
    },
    description,
    alternates: {
      canonical: `${SITE.url}/${locale}`,
      languages: localeAlternates,
    },
    openGraph: {
      type: "website",
      siteName: "Bekasen",
      title,
      description,
      url: `${SITE.url}/${locale}`,
      locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${syne.variable} ${inter.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary font-(family-name:--font-inter)">
        <ThemeProviderClient>
          <NextIntlClientProvider messages={messages}>
            <Navbar />
            {children}
            <Footer />
            <WhatsAppFloat />
            <ChatBot />
            <ConsentBanner />
          </NextIntlClientProvider>
        </ThemeProviderClient>
      </body>
    </html>
  );
}
