"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import type { PageContent } from "@/drizzle/schema";
import PageContentForm from "@/components/cms/PageContentForm";

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

export default function PageContentRow({ content }: { content: PageContent }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function togglePublish() {
    startTransition(async () => {
      const res = await fetch(`/api/content/${content.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !content.isPublished }),
      });
      if (res.ok) router.refresh();
    });
  }

  function remove() {
    if (
      !confirm(
        `Delete page content "${content.pageKey} / ${content.locale}"? This is a hard delete.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/content/${content.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    });
  }

  if (editing) {
    return (
      <tr>
        <td colSpan={5} className="p-4">
          <PageContentForm mode="edit" content={content} onClose={() => setEditing(false)} />
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-bg-card/50 transition-colors">
      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-2">
          <code className="rounded bg-bg-card px-2 py-0.5 text-xs text-text-primary">
            {content.pageKey}
          </code>
          {!content.isPublished ? (
            <span className="rounded-full bg-slate-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-300">
              hidden
            </span>
          ) : null}
        </div>
      </td>
      <td className="px-4 py-3 align-top text-xs text-text-secondary">
        {LOCALE_LABEL[content.locale] ?? content.locale}
      </td>
      <td className="px-4 py-3 align-top hidden md:table-cell text-text-secondary text-sm">
        {content.title ? (
          <span className="line-clamp-1">{content.title}</span>
        ) : (
          <span className="opacity-50">—</span>
        )}
      </td>
      <td className="px-4 py-3 align-top hidden lg:table-cell text-xs text-text-secondary">
        {formatDate(content.updatedAt)}
      </td>
      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={togglePublish}
            disabled={pending}
            className="rounded-md p-1.5 text-text-secondary hover:bg-purple-500/10 hover:text-purple-400 disabled:opacity-50"
            title={content.isPublished ? "Hide" : "Publish"}
          >
            {content.isPublished ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
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
