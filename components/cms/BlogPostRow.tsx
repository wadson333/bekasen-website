"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import type { BlogPost } from "@/drizzle/schema";
import BlogPostForm from "@/components/cms/BlogPostForm";

const LOCALE_LABEL: Record<string, string> = {
  fr: "Français",
  en: "English",
  ht: "Kreyòl",
  es: "Español",
};

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function BlogPostRow({ post }: { post: BlogPost }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function togglePublish() {
    startTransition(async () => {
      const res = await fetch(`/api/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !post.isPublished }),
      });
      if (res.ok) router.refresh();
    });
  }

  function remove() {
    if (
      !confirm(
        `Delete "${post.title}" (${post.locale})? This is a hard delete and cannot be undone.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/blog/${post.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    });
  }

  if (editing) {
    return (
      <tr>
        <td colSpan={5} className="p-4">
          <BlogPostForm mode="edit" post={post} onClose={() => setEditing(false)} />
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-bg-card/50 transition-colors">
      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-primary">{post.title}</span>
          {!post.isPublished ? (
            <span className="rounded-full bg-slate-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-300">
              draft
            </span>
          ) : (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-300">
              live
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-text-secondary truncate">{post.slug}</p>
      </td>
      <td className="px-4 py-3 align-top text-xs text-text-secondary">
        {LOCALE_LABEL[post.locale] ?? post.locale}
      </td>
      <td className="px-4 py-3 align-top hidden md:table-cell">
        <div className="flex flex-wrap gap-1">
          {post.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full border border-border bg-bg-card px-2 py-0.5 text-[10px] text-text-secondary"
            >
              {t}
            </span>
          ))}
          {post.tags.length > 3 ? (
            <span className="text-[10px] text-text-secondary">+{post.tags.length - 3}</span>
          ) : null}
        </div>
      </td>
      <td className="px-4 py-3 align-top hidden lg:table-cell text-xs text-text-secondary">
        {formatDate(post.updatedAt)}
      </td>
      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={togglePublish}
            disabled={pending}
            className="rounded-md p-1.5 text-text-secondary hover:bg-purple-500/10 hover:text-purple-400 disabled:opacity-50"
            title={post.isPublished ? "Unpublish" : "Publish"}
          >
            {post.isPublished ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-md p-1.5 text-text-secondary hover:bg-purple-500/10 hover:text-purple-400"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={remove}
            className="rounded-md p-1.5 text-text-secondary hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
