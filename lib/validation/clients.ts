import { z } from "zod";

export const ClientStatusEnum = z.enum([
  "not_started",
  "in_progress",
  "review",
  "completed",
]);
export type ClientStatus = z.infer<typeof ClientStatusEnum>;

export const MilestoneStatusEnum = z.enum(["pending", "in_progress", "completed"]);
export type MilestoneStatus = z.infer<typeof MilestoneStatusEnum>;

export const LocaleEnum = z.enum(["fr", "en", "ht", "es"]);

export const CreateClientProjectSchema = z.object({
  clientName: z.string().trim().min(1).max(255),
  clientEmail: z.string().email().max(255).optional().or(z.literal("")),
  projectTitle: z.string().trim().min(1).max(500),
  locale: LocaleEnum.default("en"),
  status: ClientStatusEnum.default("not_started"),
  progressPct: z.number().int().min(0).max(100).default(0),
  startDate: z.string().date().optional().or(z.literal("")),
  estimatedEndDate: z.string().date().optional().or(z.literal("")),
  totalPriceCents: z.number().int().min(0).optional(),
  currency: z.string().length(3).default("USD"),
  notesForClient: z.string().max(8000).optional(),
  internalNotes: z.string().max(8000).optional(),
  notifyOnUpdate: z.boolean().default(true),
});
export type CreateClientProject = z.infer<typeof CreateClientProjectSchema>;

export const UpdateClientProjectSchema = CreateClientProjectSchema.partial();

export const CreateMilestoneSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().max(2000).optional(),
  status: MilestoneStatusEnum.default("pending"),
  dueDate: z.string().date().optional().or(z.literal("")),
  displayOrder: z.number().int().min(0).default(0),
});

export const UpdateMilestoneSchema = CreateMilestoneSchema.partial();

export const CreateMessageSchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

export const CreateDeliverableSchema = z
  .object({
    label: z.string().trim().min(1).max(255),
    fileUrl: z.string().url().optional(),
    externalUrl: z.string().url().optional(),
  })
  .refine((d) => d.fileUrl || d.externalUrl, {
    message: "either_file_or_external_url_required",
  });

export const ContactSubmissionSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().email().max(255),
  projectType: z.string().max(100).optional(),
  message: z.string().trim().min(1).max(2000),
});
