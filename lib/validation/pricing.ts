import { z } from "zod";

export const BillingTypeEnum = z.enum(["one_time", "monthly", "custom"]);

// Prices stored in CENTS as integers (matches DB schema: integer columns).
// USD is required; HTG/EUR/CAD optional fallback to USD on the public site.
const priceField = z.number().int().min(0).max(1_000_000_000);

export const CreatePlanSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "lowercase_alpha_dash_only"),
  // Single-locale text — applied to all 4 locales for now (per the Portfolio
  // pattern). Per-locale editing ships when the Tiptap content editor lands.
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(2000),
  priceUsd: priceField,
  priceHtg: priceField.optional().nullable(),
  priceEur: priceField.optional().nullable(),
  priceCad: priceField.optional().nullable(),
  billingType: BillingTypeEnum,
  isPopular: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const UpdatePlanSchema = CreatePlanSchema.partial();

export const CreateFeatureSchema = z.object({
  planId: z.string().uuid(),
  label: z.string().trim().min(1).max(255),
  isIncluded: z.boolean().default(true),
  tooltip: z.string().trim().max(500).optional().or(z.literal("")),
  displayOrder: z.number().int().min(0).default(0),
});

export const UpdateFeatureSchema = z.object({
  label: z.string().trim().min(1).max(255).optional(),
  isIncluded: z.boolean().optional(),
  tooltip: z.string().trim().max(500).optional().or(z.literal("")),
  displayOrder: z.number().int().min(0).optional(),
});
