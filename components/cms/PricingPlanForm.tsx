"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/cms/ui/button";
import { Input } from "@/components/cms/ui/input";
import { Label } from "@/components/cms/ui/label";
import type { PricingPlan } from "@/drizzle/schema";

type Billing = "one_time" | "monthly" | "custom";

type Props =
  | { mode: "create"; plan?: undefined; onClose?: () => void }
  | { mode: "edit"; plan: PricingPlan; onClose: () => void };

function centsToDollars(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2);
}

function dollarsToCents(text: string): number | null {
  const clean = text.trim();
  if (!clean) return null;
  const n = Number(clean);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export default function PricingPlanForm(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(props.mode === "edit");
  const [error, setError] = useState<string | null>(null);

  const initial = props.plan;
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [name, setName] = useState(
    initial ? (initial.name.en ?? Object.values(initial.name)[0] ?? "") : "",
  );
  const [description, setDescription] = useState(
    initial ? (initial.description.en ?? Object.values(initial.description)[0] ?? "") : "",
  );
  const [priceUsdText, setPriceUsdText] = useState(centsToDollars(initial?.priceUsd));
  const [priceHtgText, setPriceHtgText] = useState(centsToDollars(initial?.priceHtg));
  const [priceEurText, setPriceEurText] = useState(centsToDollars(initial?.priceEur));
  const [priceCadText, setPriceCadText] = useState(centsToDollars(initial?.priceCad));
  const [billingType, setBillingType] = useState<Billing>(
    (initial?.billingType as Billing) ?? "one_time",
  );
  const [isPopular, setIsPopular] = useState(initial?.isPopular ?? false);
  const [displayOrder, setDisplayOrder] = useState<number>(initial?.displayOrder ?? 0);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  function close() {
    if (props.mode === "edit") props.onClose();
    else setOpen(false);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const priceUsd = dollarsToCents(priceUsdText);
    if (priceUsd === null) {
      setError("USD price is required and must be a positive number");
      return;
    }

    const payload = {
      slug: slug.trim(),
      name: name.trim(),
      description: description.trim(),
      priceUsd,
      priceHtg: dollarsToCents(priceHtgText),
      priceEur: dollarsToCents(priceEurText),
      priceCad: dollarsToCents(priceCadText),
      billingType,
      isPopular,
      displayOrder,
      isActive,
    };

    startTransition(async () => {
      const url = props.mode === "edit" ? `/api/pricing/${initial!.id}` : "/api/pricing";
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
        setSlug("");
        setName("");
        setDescription("");
        setPriceUsdText("");
        setPriceHtgText("");
        setPriceEurText("");
        setPriceCadText("");
        setIsPopular(false);
        setDisplayOrder(0);
        setIsActive(true);
      }
      router.refresh();
      if (props.mode === "edit") props.onClose();
    });
  }

  if (props.mode === "create" && !open) {
    return (
      <Button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2">
        <Plus className="h-4 w-4" /> New plan
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-purple-500/30 bg-bg-secondary p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-(family-name:--font-syne) text-lg font-bold text-text-primary">
          {props.mode === "edit" ? "Edit plan" : "New pricing plan"}
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
          <Label htmlFor="pl-slug">Slug *</Label>
          <Input
            id="pl-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            placeholder="starter"
            required
            disabled={props.mode === "edit"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pl-billing">Billing type *</Label>
          <select
            id="pl-billing"
            value={billingType}
            onChange={(e) => setBillingType(e.target.value as Billing)}
            className="flex h-10 w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            <option value="one_time">One-time</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom (quote)</option>
          </select>
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="pl-name">Name *</Label>
          <Input
            id="pl-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Starter"
            required
          />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="pl-desc">Description *</Label>
          <textarea
            id="pl-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={2000}
            required
            className="w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus-visible:ring-2 focus-visible:ring-purple-500"
            placeholder="Premium template-based website for small businesses…"
          />
          <p className="text-[11px] text-text-secondary">
            Single text applied to all 4 locales (fr/en/ht/es). Per-locale editing ships with the Tiptap content editor.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pl-usd">Price USD * (e.g. 799.00)</Label>
          <Input
            id="pl-usd"
            type="number"
            step="0.01"
            min="0"
            value={priceUsdText}
            onChange={(e) => setPriceUsdText(e.target.value)}
            placeholder="799.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pl-htg">Price HTG (optional)</Label>
          <Input
            id="pl-htg"
            type="number"
            step="0.01"
            min="0"
            value={priceHtgText}
            onChange={(e) => setPriceHtgText(e.target.value)}
            placeholder="105000.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pl-eur">Price EUR (optional)</Label>
          <Input
            id="pl-eur"
            type="number"
            step="0.01"
            min="0"
            value={priceEurText}
            onChange={(e) => setPriceEurText(e.target.value)}
            placeholder="739.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pl-cad">Price CAD (optional)</Label>
          <Input
            id="pl-cad"
            type="number"
            step="0.01"
            min="0"
            value={priceCadText}
            onChange={(e) => setPriceCadText(e.target.value)}
            placeholder="1090.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pl-order">Display order</Label>
          <Input
            id="pl-order"
            type="number"
            min="0"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value) || 0)}
          />
        </div>
        <div className="flex items-center gap-4 lg:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={isPopular}
              onChange={(e) => setIsPopular(e.target.checked)}
              className="h-4 w-4 rounded border-border text-purple-600 focus:ring-purple-500"
            />
            Popular badge (homepage highlight)
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-border text-purple-600 focus:ring-purple-500"
            />
            Active (visible on public site)
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
            disabled={pending || !slug.trim() || !name.trim() || !description.trim() || !priceUsdText.trim()}
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
