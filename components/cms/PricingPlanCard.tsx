"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Star, Trash2, Power } from "lucide-react";
import type { PricingPlan, PricingFeature } from "@/drizzle/schema";
import PricingPlanForm from "@/components/cms/PricingPlanForm";
import PricingFeatureManager from "@/components/cms/PricingFeatureManager";

type PlanWithFeatures = PricingPlan & { features: PricingFeature[] };

const BILLING_LABEL: Record<string, string> = {
  one_time: "one-time",
  monthly: "/ month",
  custom: "custom quote",
};

function formatCents(cents: number | null | undefined, currency: string): string | null {
  if (cents == null) return null;
  const value = (cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${currency} ${value}`;
}

export default function PricingPlanCard({ plan }: { plan: PlanWithFeatures }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function deactivate() {
    if (!confirm(`Deactivate "${plan.name.en}"? It will disappear from the public pricing page.`)) {
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/pricing/${plan.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    });
  }

  function toggleActive() {
    startTransition(async () => {
      const res = await fetch(`/api/pricing/${plan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
      if (res.ok) router.refresh();
    });
  }

  if (editing) {
    return (
      <div className="lg:col-span-3">
        <PricingPlanForm mode="edit" plan={plan} onClose={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <article
      className={`flex flex-col rounded-xl border bg-bg-secondary ${
        plan.isPopular ? "border-purple-500/60" : "border-border"
      } ${plan.isActive ? "" : "opacity-60"}`}
    >
      <header className="border-b border-border p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              {plan.isPopular ? (
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" aria-label="Popular" />
              ) : null}
              <h2 className="font-(family-name:--font-syne) text-xl font-bold text-text-primary">
                {plan.name.en}
              </h2>
              {!plan.isActive ? (
                <span className="rounded-full bg-slate-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-300">
                  inactive
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-xs text-text-secondary">{plan.slug}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleActive}
              disabled={pending}
              className="rounded-md p-1.5 text-text-secondary hover:bg-purple-500/10 hover:text-purple-400 disabled:opacity-50"
              title={plan.isActive ? "Deactivate" : "Activate"}
            >
              <Power className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-md p-1.5 text-text-secondary hover:bg-purple-500/10 hover:text-purple-400"
              title="Edit plan"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={deactivate}
              className="rounded-md p-1.5 text-text-secondary hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
              title="Deactivate"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-text-secondary line-clamp-3">{plan.description.en}</p>

        <div className="mt-4">
          <p className="font-(family-name:--font-syne) text-2xl font-bold text-text-primary">
            {formatCents(plan.priceUsd, "$")}
            <span className="ml-2 text-xs font-normal text-text-secondary">
              {BILLING_LABEL[plan.billingType] ?? plan.billingType}
            </span>
          </p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-text-secondary">
            {formatCents(plan.priceHtg, "HTG") ? <span>{formatCents(plan.priceHtg, "HTG")}</span> : null}
            {formatCents(plan.priceEur, "€") ? <span>{formatCents(plan.priceEur, "€")}</span> : null}
            {formatCents(plan.priceCad, "CA$") ? <span>{formatCents(plan.priceCad, "CA$")}</span> : null}
          </div>
        </div>
      </header>

      <PricingFeatureManager planId={plan.id} features={plan.features} />
    </article>
  );
}
