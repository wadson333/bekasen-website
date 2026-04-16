import type { Metadata } from "next";
import { Syne, Inter, Playfair_Display } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Footer from "@/components/layout/Footer";
import ChatBot from "@/components/ChatBot";
import ThemeProviderClient from "@/components/ui/ThemeProviderClient";
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

export const metadata: Metadata = {
  title: {
    default: "Bekasen — Agence Digitale Premium",
    template: "%s | Bekasen",
  },
  description:
    "Bekasen est une agence digitale premium au service des entreprises haïtiennes et de la diaspora.",
};

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
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary font-(family-name:--font-inter)">
        <ThemeProviderClient>
          <NextIntlClientProvider messages={messages}>
            {children}
            <Footer />
            <ChatBot />
          </NextIntlClientProvider>
        </ThemeProviderClient>
      </body>
    </html>
  );
}
