"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash2, X } from "lucide-react";
import type { PricingFeature } from "@/drizzle/schema";
import { Button } from "@/components/cms/ui/button";
import { Input } from "@/components/cms/ui/input";

export default function PricingFeatureManager({
  planId,
  features,
}: {
  planId: string;
  features: PricingFeature[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [included, setIncluded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setLabel("");
    setIncluded(true);
    setAdding(false);
    setError(null);
  }

  function add(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const clean = label.trim();
    if (!clean) {
      setError("Label is required");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/pricing-features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          label: clean,
          isIncluded: included,
          displayOrder: features.length,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Save failed");
        return;
      }
      reset();
      router.refresh();
    });
  }

  function toggle(feature: PricingFeature) {
    startTransition(async () => {
      const res = await fetch(`/api/pricing-features/${feature.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isIncluded: !feature.isIncluded }),
      });
      if (res.ok) router.refresh();
    });
  }

  function remove(feature: PricingFeature) {
    if (!confirm(`Remove "${feature.label.en}"?`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/pricing-features/${feature.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="flex flex-1 flex-col p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
        Features ({features.length})
      </h3>

      {features.length === 0 ? (
        <p className="text-xs text-text-secondary opacity-60">No features yet.</p>
      ) : (
        <ul className="space-y-1">
          {features.map((f) => (
            <li
              key={f.id}
              className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-bg-card/50"
            >
              <button
                type="button"
                onClick={() => toggle(f)}
                disabled={pending}
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                  f.isIncluded
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/15 text-red-400"
                }`}
                title={f.isIncluded ? "Included — click to mark excluded" : "Excluded — click to mark included"}
              >
                {f.isIncluded ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              </button>
              <span
                className={`flex-1 text-sm ${
                  f.isIncluded ? "text-text-primary" : "text-text-secondary line-through"
                }`}
              >
                {f.label.en}
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() => remove(f)}
                className="rounded-md p-1 text-text-secondary opacity-0 hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 disabled:opacity-50"
                title="Remove"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 border-t border-border pt-4">
        {adding ? (
          <form onSubmit={add} className="space-y-2">
            <Input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Mobile-responsive design"
              maxLength={255}
            />
            <label className="inline-flex items-center gap-2 text-xs text-text-primary">
              <input
                type="checkbox"
                checked={included}
                onChange={(e) => setIncluded(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border text-purple-600 focus:ring-purple-500"
              />
              Included (uncheck for crossed-out / excluded)
            </label>
            {error ? (
              <p className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-[11px] text-red-300">
                {error}
              </p>
            ) : null}
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={pending || !label.trim()} className="h-8 px-3 text-xs">
                {pending ? "Adding…" : "Add"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={reset}
                className="h-8 px-3 text-xs"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300"
          >
            <Plus className="h-3.5 w-3.5" /> Add feature
          </button>
        )}
      </div>
    </div>
  );
}
