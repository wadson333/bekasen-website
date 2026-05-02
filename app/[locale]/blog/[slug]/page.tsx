import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogPosts } from "@/drizzle/schema";
import { renderMarkdown } from "@/lib/markdown";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Locale = "fr" | "en" | "ht" | "es";
type Params = { locale: Locale; slug: string };

const BACK_LABEL: Record<Locale, string> = {
  fr: "← Retour au blog",
  en: "← Back to blog",
  ht: "← Tounen nan blog",
  es: "← Volver al blog",
};

function formatDate(d: Date | string | null | undefined, locale: Locale): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  const intlLocale =
    locale === "en" ? "en-US" : locale === "es" ? "es-ES" : locale === "ht" ? "fr-HT" : "fr-FR";
  return dt.toLocaleDateString(intlLocale, { day: "2-digit", month: "long", year: "numeric" });
}

async function getPost(locale: Locale, slug: string) {
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.slug, slug),
        eq(blogPosts.locale, locale),
        eq(blogPosts.isPublished, true),
      ),
    )
    .limit(1);
  return post ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(locale, slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  const post = await getPost(locale, slug);
  if (!post) notFound();

  const html = renderMarkdown(post.body);

  return (
    <main className="flex-1 px-6 py-12 lg:py-16">
      <article className="mx-auto max-w-3xl">
        <Link
          href={`/${locale}/blog`}
          className="mb-8 inline-flex items-center text-xs font-medium text-purple-400 hover:text-purple-300"
        >
          {BACK_LABEL[locale]}
        </Link>

        <header className="mb-8">
          <p className="mb-3 text-[11px] uppercase tracking-wider text-purple-400">
            {formatDate(post.publishedAt, locale)}
          </p>
          <h1 className="font-(family-name:--font-syne) text-3xl font-bold text-text-primary lg:text-4xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-4 text-lg text-text-secondary">{post.excerpt}</p>
          ) : null}
          {post.tags.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-bg-card px-2.5 py-0.5 text-[11px] text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="mb-10 aspect-video w-full rounded-xl object-cover"
          />
        ) : null}

        <div
          className="bk-prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </main>
  );
}
