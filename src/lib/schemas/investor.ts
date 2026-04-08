import { z } from "zod";

export const investorSchema = z.object({
  name: z.string().min(1, "Investor name is required"),
  type: z.enum(["individual", "entity", "fund", "family_office", "institution", "other"]).default("individual"),
  contact_id: z.string().uuid().optional().or(z.literal("")),
  company_id: z.string().uuid().optional().or(z.literal("")),
  accredited: z.boolean().default(false),
  tax_id: z.string().optional().or(z.literal("")),
  entity_name: z.string().optional().or(z.literal("")),
  address_line1: z.string().optional().or(z.literal("")),
  address_city: z.string().optional().or(z.literal("")),
  address_state: z.string().optional().or(z.literal("")),
  address_zip: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type InvestorFormData = z.infer<typeof investorSchema>;

export const commitmentSchema = z.object({
  investor_id: z.string().uuid("Select an investor"),
  deal_id: z.string().uuid("Select a deal"),
  committed_amount: z.coerce.number().min(0, "Amount must be positive"),
  called_amount: z.coerce.number().min(0).default(0),
  status: z.enum(["committed", "partially_called", "fully_called", "returned"]).default("committed"),
  commitment_date: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type CommitmentFormData = z.infer<typeof commitmentSchema>;

export const distributionSchema = z.object({
  investor_id: z.string().uuid("Select an investor"),
  deal_id: z.string().uuid("Select a deal"),
  commitment_id: z.string().uuid().optional().or(z.literal("")),
  distribution_date: z.string().min(1, "Distribution date is required"),
  amount: z.coerce.number().min(0.01, "Amount must be positive"),
  type: z.enum(["preferred_return", "profit_share", "return_of_capital", "refinance_proceeds", "sale_proceeds", "other"]).default("preferred_return"),
  period_label: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type DistributionFormData = z.infer<typeof distributionSchema>;

export const waterfallTierSchema = z.object({
  deal_id: z.string().uuid("Select a deal"),
  tier_order: z.coerce.number().int().min(1),
  tier_label: z.string().min(1, "Tier label is required"),
  hurdle_rate: z.coerce.number().nullable().optional(),
  lp_split_pct: z.coerce.number().min(0).max(100).nullable().optional(),
  gp_split_pct: z.coerce.number().min(0).max(100).nullable().optional(),
  is_catch_up: z.boolean().default(false),
  notes: z.string().optional().or(z.literal("")),
});

export type WaterfallTierFormData = z.infer<typeof waterfallTierSchema>;
