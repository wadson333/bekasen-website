import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/drizzle/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
};

type Locale = "fr" | "en" | "ht" | "es";

const READ_LABEL: Record<Locale, string> = {
  fr: "Lire l'article",
  en: "Read the article",
  ht: "Li atik la",
  es: "Leer el artículo",
};

const EMPTY_LABEL: Record<Locale, string> = {
  fr: "Aucun article publié pour le moment. Revenez bientôt.",
  en: "No published articles yet. Check back soon.",
  ht: "Pa gen atik pibliye pou kounye a. Tounen byento.",
  es: "Aún no hay artículos publicados. Vuelva pronto.",
};

function formatDate(d: Date | string | null | undefined, locale: Locale): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  const intlLocale =
    locale === "en" ? "en-US" : locale === "es" ? "es-ES" : locale === "ht" ? "fr-HT" : "fr-FR";
  return dt.toLocaleDateString(intlLocale, { day: "2-digit", month: "long", year: "numeric" });
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  const posts = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.isPublished, true), eq(blogPosts.locale, locale)))
    .orderBy(desc(blogPosts.publishedAt));

  return (
    <main className="flex-1 px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 text-center">
          <h1 className="font-(family-name:--font-syne) text-4xl font-bold lg:text-5xl">
            <span className="bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent">
              {t("title")}
            </span>
          </h1>
          <p className="mt-3 text-text-secondary">{t("subtitle")}</p>
        </header>

        {posts.length === 0 ? (
          <div className="mx-auto max-w-md rounded-xl border border-dashed border-border bg-bg-secondary px-6 py-12 text-center">
            <p className="text-sm text-text-secondary">{EMPTY_LABEL[locale]}</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li
                key={post.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-bg-secondary transition-colors hover:border-purple-500/50"
              >
                {post.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="aspect-video w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="aspect-video w-full bg-bg-card" />
                )}
                <div className="flex flex-1 flex-col p-5">
                  <p className="mb-2 text-[11px] uppercase tracking-wider text-purple-400">
                    {formatDate(post.publishedAt, locale)}
                  </p>
                  <h2 className="font-(family-name:--font-syne) text-lg font-bold text-text-primary group-hover:text-purple-400 line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt ? (
                    <p className="mt-2 flex-1 text-sm text-text-secondary line-clamp-3">{post.excerpt}</p>
                  ) : (
                    <div className="flex-1" />
                  )}
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="mt-4 inline-flex items-center text-xs font-medium text-purple-400 hover:text-purple-300"
                  >
                    {READ_LABEL[locale]} →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
