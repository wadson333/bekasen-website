import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { pricingPlans, pricingFeatures } from "@/drizzle/schema";
import { COOKIE_NAMES, verifyAccessToken } from "@/lib/auth";
import { getAdminById } from "@/lib/auth-server";
import { extractPanelUidFromPath } from "@/lib/panel-uid";
import AdminShell from "@/components/cms/AdminShell";
import PricingPlanForm from "@/components/cms/PricingPlanForm";
import PricingPlanCard from "@/components/cms/PricingPlanCard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAMES.access)?.value;
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  if (!payload?.sub) return null;
  return getAdminById(payload.sub);
}

async function readPanelUid(): Promise<string> {
  const fromEnv = process.env.ADMIN_PANEL_UID?.trim();
  if (fromEnv) return fromEnv;
  const h = await headers();
  return extractPanelUidFromPath(h.get("x-invoke-path") ?? "") ?? "";
}

export default async function PricingCmsPage() {
  const uid = await readPanelUid();
  const admin = await requireAdmin();
  if (!admin) redirect(`/panel/${uid}/login`);

  const plans = await db.select().from(pricingPlans).orderBy(asc(pricingPlans.displayOrder));
  const features = await db
    .select()
    .from(pricingFeatures)
    .orderBy(asc(pricingFeatures.displayOrder));

  const grouped = plans.map((p) => ({
    ...p,
    features: features.filter((f) => f.planId === p.id),
  }));

  return (
    <AdminShell email={admin.email}>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-(family-name:--font-syne) text-3xl font-bold text-text-primary">
              Pricing
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Plans and features shown on the public pricing page. Prices are in cents (USD: 79900 = $799).
            </p>
          </div>
          <PricingPlanForm mode="create" />
        </header>

        {grouped.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-bg-secondary px-6 py-16 text-center">
            <p className="text-sm text-text-secondary">
              No pricing plans yet. Click <span className="font-semibold text-text-primary">New plan</span> to add one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {grouped.map((plan) => (
              <PricingPlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
