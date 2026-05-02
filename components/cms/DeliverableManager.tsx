"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, FileText, Plus, X } from "lucide-react";
import { Button } from "@/components/cms/ui/button";
import { Input } from "@/components/cms/ui/input";
import { Label } from "@/components/cms/ui/label";
import type { ProjectDeliverable } from "@/drizzle/schema";

export default function DeliverableManager({
  projectId,
  deliverables,
}: {
  projectId: string;
  deliverables: ProjectDeliverable[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [label, setLabel] = useState("");
  const [externalUrl, setExternalUrl] = useState("");

  function reset() {
    setLabel("");
    setExternalUrl("");
    setError(null);
  }

  function add(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!externalUrl.trim()) {
      setError("Enter an external URL (Figma, staging link, etc.)");
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/clients/${projectId}/deliverables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          externalUrl: externalUrl.trim(),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Could not add deliverable");
        return;
      }
      reset();
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border border-border bg-bg-secondary p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-(family-name:--font-syne) text-xl font-bold text-text-primary">
          Deliverables
        </h2>
        {!open ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Attach link
          </Button>
        ) : null}
      </div>

      {open ? (
        <form onSubmit={add} className="mt-4 space-y-3 rounded-lg border border-purple-500/20 bg-bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-primary">New deliverable</p>
            <button
              type="button"
              onClick={() => {
                reset();
                setOpen(false);
              }}
              className="rounded-md p-1 text-text-secondary hover:bg-bg-primary"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="d-label">Label *</Label>
              <Input
                id="d-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Final design — Homepage"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-url">External URL *</Label>
              <Input
                id="d-url"
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://figma.com/file/..."
                required
              />
            </div>
          </div>
          <p className="text-xs text-text-secondary">
            File upload (PDF/ZIP) coming in a later phase. For now, attach Figma, staging, or
            cloud-storage links.
          </p>
          {error ? (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          ) : null}
          <Button type="submit" size="sm" disabled={pending || !label.trim() || !externalUrl.trim()}>
            {pending ? "Adding…" : "Attach"}
          </Button>
        </form>
      ) : null}

      {deliverables.length === 0 ? (
        <p className="mt-4 text-sm text-text-secondary">
          No deliverables yet. Attach Figma, staging, or download links — your client will see
          them on their dashboard.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {deliverables.map((d) => {
            const href = d.fileUrl ?? d.externalUrl ?? "#";
            const isExternal = !d.fileUrl && !!d.externalUrl;
            return (
              <li key={d.id}>
                <a
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-card p-3 hover:border-purple-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-purple-500/15 text-purple-300">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{d.label}</p>
                      <p className="text-xs text-text-secondary truncate">{href}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-text-secondary" />
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
