import { z } from "zod";

export const dealSchema = z.object({
  name: z.string().min(1, "Deal name is required"),
  asset_class: z.enum([
    "ios",
    "marina",
    "hospitality",
    "multifamily",
    "transitional",
    "other",
  ]),
  stage: z
    .enum([
      "sourcing",
      "loi",
      "under_contract",
      "due_diligence",
      "closed",
      "dead",
    ])
    .optional()
    .default("sourcing"),
  property_id: z.string().uuid().nullable().optional(),
  lead_broker_id: z.string().uuid().nullable().optional(),
  lead_source: z.string().optional().or(z.literal("")),
  assigned_to: z.string().uuid().nullable().optional(),
  description: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).optional().default([]),
  custom_fields: z.record(z.unknown()).optional().default({}),
  // Key dates
  sourced_at: z.string().optional().or(z.literal("")),
  loi_submitted_at: z.string().optional().or(z.literal("")),
  loi_accepted_at: z.string().optional().or(z.literal("")),
  contract_date: z.string().optional().or(z.literal("")),
  due_diligence_start: z.string().optional().or(z.literal("")),
  due_diligence_end: z.string().optional().or(z.literal("")),
  closing_date: z.string().optional().or(z.literal("")),
  dead_at: z.string().optional().or(z.literal("")),
  dead_reason: z.string().optional().or(z.literal("")),
});

export type DealFormData = z.infer<typeof dealSchema>;

export const dealStageUpdateSchema = z.object({
  deal_id: z.string().uuid(),
  stage: z.enum([
    "sourcing",
    "loi",
    "under_contract",
    "due_diligence",
    "closed",
    "dead",
  ]),
  stage_position: z.number().int().min(0),
});

export type DealStageUpdateData = z.infer<typeof dealStageUpdateSchema>;
