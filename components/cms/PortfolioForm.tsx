"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/cms/ui/button";
import { Input } from "@/components/cms/ui/input";
import { Label } from "@/components/cms/ui/label";
import type { PortfolioProject } from "@/drizzle/schema";

type Category = "showcase" | "business" | "webapp" | "saas";

type Props =
  | { mode: "create"; project?: undefined; onClose?: () => void }
  | { mode: "edit"; project: PortfolioProject; onClose: () => void };

export default function PortfolioForm(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(props.mode === "edit");
  const [error, setError] = useState<string | null>(null);

  const initial = props.project;
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(
    initial ? (initial.title.en ?? Object.values(initial.title)[0] ?? "") : "",
  );
  const [description, setDescription] = useState(
    initial ? (initial.description.en ?? Object.values(initial.description)[0] ?? "") : "",
  );
  const [category, setCategory] = useState<Category>(
    (initial?.category as Category) ?? "showcase",
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? "");
  const [demoUrl, setDemoUrl] = useState(initial?.demoUrl ?? "");
  const [techStackText, setTechStackText] = useState(initial?.techStack.join(", ") ?? "");
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);

  function close() {
    if (props.mode === "edit") props.onClose();
    else setOpen(false);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const techStack = techStackText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      slug: slug.trim(),
      title: title.trim(),
      description: description.trim(),
      category,
      thumbnailUrl: thumbnailUrl.trim(),
      demoUrl: demoUrl.trim() || "",
      techStack,
      isFeatured,
      isPublished,
    };

    startTransition(async () => {
      const url = props.mode === "edit" ? `/api/portfolio/${initial!.id}` : "/api/portfolio";
      const method = props.mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Save failed");
        return;
      }
      if (props.mode === "create") {
        setOpen(false);
        // Reset
        setSlug("");
        setTitle("");
        setDescription("");
        setThumbnailUrl("");
        setDemoUrl("");
        setTechStackText("");
        setIsFeatured(false);
        setIsPublished(true);
      }
      router.refresh();
      if (props.mode === "edit") props.onClose();
    });
  }

  if (props.mode === "create" && !open) {
    return (
      <Button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2">
        <Plus className="h-4 w-4" /> New project
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-purple-500/30 bg-bg-secondary p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-(family-name:--font-syne) text-lg font-bold text-text-primary">
          {props.mode === "edit" ? "Edit project" : "New portfolio project"}
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

      <form onSubmit={submit} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="p-slug">Slug *</Label>
          <Input
            id="p-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            placeholder="clinix-pro"
            required
            disabled={props.mode === "edit"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-cat">Category *</Label>
          <select
            id="p-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="flex h-10 w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            <option value="showcase">Showcase</option>
            <option value="business">Business</option>
            <option value="webapp">Web app</option>
            <option value="saas">SaaS</option>
          </select>
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="p-title">Title *</Label>
          <Input
            id="p-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Clinix Pro"
            required
          />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="p-desc">Description *</Label>
          <textarea
            id="p-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={2000}
            required
            className="w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus-visible:ring-2 focus-visible:ring-purple-500"
            placeholder="Complete medical ERP with patient management, appointments and billing."
          />
          <p className="text-[11px] text-text-secondary">
            For now this single text is applied to all 4 locales (fr/en/ht/es). Per-locale
            editing ships when the Tiptap content editor lands.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-thumb">Thumbnail URL *</Label>
          <Input
            id="p-thumb"
            type="url"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://..."
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-demo">Demo URL (optional)</Label>
          <Input
            id="p-demo"
            type="url"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            placeholder="https://clinix-pro.bekasen.com"
          />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="p-tech">Tech stack (comma-separated) *</Label>
          <Input
            id="p-tech"
            value={techStackText}
            onChange={(e) => setTechStackText(e.target.value)}
            placeholder="Next.js, Tailwind, PostgreSQL"
            required
          />
        </div>
        <div className="flex items-center gap-4 lg:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-border text-purple-600 focus:ring-purple-500"
            />
            Featured on homepage
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-border text-purple-600 focus:ring-purple-500"
            />
            Published
          </label>
        </div>

        {error ? (
          <p className="lg:col-span-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        ) : null}

        <div className="lg:col-span-2 flex items-center gap-2">
          <Button
            type="submit"
            disabled={pending || !slug.trim() || !title.trim() || !description.trim() || !thumbnailUrl.trim()}
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
