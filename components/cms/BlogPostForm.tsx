"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/cms/ui/button";
import { Input } from "@/components/cms/ui/input";
import { Label } from "@/components/cms/ui/label";
import type { BlogPost } from "@/drizzle/schema";

type Locale = "fr" | "en" | "ht" | "es";

type Props =
  | { mode: "create"; post?: undefined; onClose?: () => void }
  | { mode: "edit"; post: BlogPost; onClose: () => void };

export default function BlogPostForm(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(props.mode === "edit");
  const [error, setError] = useState<string | null>(null);

  const initial = props.post;
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [locale, setLocale] = useState<Locale>((initial?.locale as Locale) ?? "fr");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? "");
  const [tagsText, setTagsText] = useState(initial?.tags.join(", ") ?? "");
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);

  function close() {
    if (props.mode === "edit") props.onClose();
    else setOpen(false);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const tags = tagsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      slug: slug.trim(),
      locale,
      title: title.trim(),
      excerpt: excerpt.trim(),
      body: body.trim(),
      coverImageUrl: coverImageUrl.trim(),
      tags,
      isPublished,
    };

    startTransition(async () => {
      const url = props.mode === "edit" ? `/api/blog/${initial!.id}` : "/api/blog";
      const method = props.mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        if (body?.error === "duplicate_slug_locale") {
          setError("A post with this slug + locale already exists");
        } else {
          setError(body?.error ?? "Save failed");
        }
        return;
      }
      if (props.mode === "create") {
        setOpen(false);
        setSlug("");
        setTitle("");
        setExcerpt("");
        setBody("");
        setCoverImageUrl("");
        setTagsText("");
        setIsPublished(false);
      }
      router.refresh();
      if (props.mode === "edit") props.onClose();
    });
  }

  if (props.mode === "create" && !open) {
    return (
      <Button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2">
        <Plus className="h-4 w-4" /> New post
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-purple-500/30 bg-bg-secondary p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-(family-name:--font-syne) text-lg font-bold text-text-primary">
          {props.mode === "edit" ? "Edit post" : "New blog post"}
        </h3>
        <button
          type="button"
          onClick={close}
          className="rounded-md p-1 text-text-secondary hover:bg-bg-card"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="b-slug">Slug *</Label>
          <Input
            id="b-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            placeholder="why-haitian-businesses-need-cms"
            required
            disabled={props.mode === "edit"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="b-loc">Locale *</Label>
          <select
            id="b-loc"
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            disabled={props.mode === "edit"}
            className="flex h-10 w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-60"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="ht">Kreyòl</option>
            <option value="es">Español</option>
          </select>
        </div>

        <div className="space-y-2 lg:col-span-3">
          <Label htmlFor="b-title">Title *</Label>
          <Input
            id="b-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Why Haitian businesses need a CMS"
            required
            maxLength={500}
          />
        </div>

        <div className="space-y-2 lg:col-span-3">
          <Label htmlFor="b-excerpt">Excerpt</Label>
          <textarea
            id="b-excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            maxLength={2000}
            className="w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus-visible:ring-2 focus-visible:ring-purple-500"
            placeholder="Short summary shown on the blog index and OG cards…"
          />
        </div>

        <div className="space-y-2 lg:col-span-3">
          <Label htmlFor="b-body">
            Body (Markdown) *{" "}
            <span className="text-[11px] font-normal text-text-secondary">
              Supports # headings, **bold**, *italic*, [links](https://…), `code`, lists, blockquotes
            </span>
          </Label>
          <textarea
            id="b-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={16}
            maxLength={200000}
            required
            spellCheck={false}
            className="w-full rounded-md border border-border bg-bg-primary px-3 py-2 font-mono text-xs text-text-primary placeholder:text-text-secondary/60 focus-visible:ring-2 focus-visible:ring-purple-500"
            placeholder={`# Why Haitian businesses need a CMS\n\nWriting cleanly is more than aesthetics…\n\n## The problem\n\n- Static sites are hard to update\n- Owners depend on developers\n\n## The solution\n\nA simple admin lets you publish in minutes.`}
          />
          <p className="text-[11px] text-text-secondary">
            {body.length.toLocaleString()} chars
          </p>
        </div>

        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="b-cover">Cover image URL</Label>
          <Input
            id="b-cover"
            type="url"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://images.bekasen.com/blog/post-cover.jpg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="b-tags">Tags (comma)</Label>
          <Input
            id="b-tags"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="cms, haiti, business"
          />
        </div>

        <div className="lg:col-span-3">
          <label className="inline-flex items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-border text-purple-600 focus:ring-purple-500"
            />
            Publish (visible on the public blog)
          </label>
        </div>

        {error ? (
          <p className="lg:col-span-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        ) : null}

        <div className="lg:col-span-3 flex items-center gap-2">
          <Button
            type="submit"
            disabled={pending || !slug.trim() || !title.trim() || !body.trim()}
          >
            {pending ? "Saving…" : props.mode === "edit" ? "Save changes" : "Create"}
          </Button>
          <Button type="button" variant="ghost" onClick={close}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
