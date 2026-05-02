"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/cms/ui/button";
import { Input } from "@/components/cms/ui/input";
import { Label } from "@/components/cms/ui/label";
import type { PageContent } from "@/drizzle/schema";
import { unwrapMarkdown, type PageContentBody } from "@/lib/validation/content";

type Locale = "fr" | "en" | "ht" | "es";

type Props =
  | { mode: "create"; content?: undefined; onClose?: () => void }
  | { mode: "edit"; content: PageContent; onClose: () => void };

const COMMON_KEYS = ["hero", "about", "services", "contact", "footer", "cta", "diaspora_promise"];

export default function PageContentForm(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(props.mode === "edit");
  const [error, setError] = useState<string | null>(null);

  const initial = props.content;
  const [pageKey, setPageKey] = useState(initial?.pageKey ?? "");
  const [locale, setLocale] = useState<Locale>((initial?.locale as Locale) ?? "fr");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [bodyMarkdown, setBodyMarkdown] = useState(
    initial ? unwrapMarkdown(initial.body as PageContentBody) : "",
  );
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription ?? "");
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);

  function close() {
    if (props.mode === "edit") props.onClose();
    else setOpen(false);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      pageKey: pageKey.trim(),
      locale,
      title: title.trim(),
      bodyMarkdown: bodyMarkdown.trim(),
      metaTitle: metaTitle.trim(),
      metaDescription: metaDescription.trim(),
      isPublished,
    };

    startTransition(async () => {
      const url = props.mode === "edit" ? `/api/content/${initial!.id}` : "/api/content";
      const method = props.mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        if (body?.error === "duplicate_pagekey_locale") {
          setError("A row with this page key + locale already exists");
        } else {
          setError(body?.error ?? "Save failed");
        }
        return;
      }
      if (props.mode === "create") {
        setOpen(false);
        setPageKey("");
        setTitle("");
        setBodyMarkdown("");
        setMetaTitle("");
        setMetaDescription("");
        setIsPublished(true);
      }
      router.refresh();
      if (props.mode === "edit") props.onClose();
    });
  }

  if (props.mode === "create" && !open) {
    return (
      <Button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2">
        <Plus className="h-4 w-4" /> New entry
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-purple-500/30 bg-bg-secondary p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-(family-name:--font-syne) text-lg font-bold text-text-primary">
          {props.mode === "edit" ? "Edit page content" : "New page content"}
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
          <Label htmlFor="pc-key">Page key *</Label>
          <Input
            id="pc-key"
            value={pageKey}
            onChange={(e) =>
              setPageKey(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "-"))
            }
            placeholder="hero"
            list="pc-key-suggestions"
            required
            disabled={props.mode === "edit"}
          />
          <datalist id="pc-key-suggestions">
            {COMMON_KEYS.map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>
          <p className="text-[11px] text-text-secondary">
            Common keys: {COMMON_KEYS.join(", ")}. Pick one or invent a new one.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pc-locale">Locale *</Label>
          <select
            id="pc-locale"
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
          <Label htmlFor="pc-title">Title (optional)</Label>
          <Input
            id="pc-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Section heading shown on the page"
            maxLength={500}
          />
        </div>

        <div className="space-y-2 lg:col-span-3">
          <Label htmlFor="pc-body">
            Body (Markdown) *{" "}
            <span className="text-[11px] font-normal text-text-secondary">
              Stored as <code className="rounded bg-bg-card px-1">{`{ blocks: [{ type: "markdown", content }] }`}</code>
            </span>
          </Label>
          <textarea
            id="pc-body"
            value={bodyMarkdown}
            onChange={(e) => setBodyMarkdown(e.target.value)}
            rows={14}
            maxLength={200000}
            required
            spellCheck={false}
            className="w-full rounded-md border border-border bg-bg-primary px-3 py-2 font-mono text-xs text-text-primary placeholder:text-text-secondary/60 focus-visible:ring-2 focus-visible:ring-purple-500"
            placeholder={`# Long-form copy\n\nThis section text overrides the matching slot in messages/*.json…`}
          />
        </div>

        <div className="space-y-2 lg:col-span-3">
          <Label htmlFor="pc-meta-title">Meta title (SEO)</Label>
          <Input
            id="pc-meta-title"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Bekasen — pages personnalisées pour PME haïtiennes"
            maxLength={255}
          />
        </div>
        <div className="space-y-2 lg:col-span-3">
          <Label htmlFor="pc-meta-desc">Meta description (SEO)</Label>
          <textarea
            id="pc-meta-desc"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={2}
            maxLength={1000}
            className="w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus-visible:ring-2 focus-visible:ring-purple-500"
            placeholder="120-160 chars: appears in Google snippet and OG previews."
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
            Published (public page reads this row)
          </label>
        </div>

        {error ? (
          <p className="lg:col-span-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        ) : null}

        <div className="lg:col-span-3 flex items-center gap-2">
          <Button type="submit" disabled={pending || !pageKey.trim() || !bodyMarkdown.trim()}>
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
