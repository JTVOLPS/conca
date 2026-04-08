import { z } from "zod";

export const leaseSchema = z.object({
  tenant_id: z.string().uuid(),
  property_id: z.string().uuid(),
  lease_type: z.enum([
    "gross",
    "modified_gross",
    "nnn",
    "percentage",
    "ground",
    "month_to_month",
    "other",
  ]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional().or(z.literal("")),
  rent_amount: z.coerce.number().nullable().optional(),
  rent_frequency: z
    .enum(["monthly", "quarterly", "annually"])
    .optional()
    .default("monthly"),
  rent_escalation_pct: z.coerce.number().nullable().optional(),
  rent_escalation_date: z.string().optional().or(z.literal("")),
  security_deposit: z.coerce.number().nullable().optional(),
  cam_charges: z.coerce.number().nullable().optional(),
  free_rent_months: z.coerce.number().int().nullable().optional(),
  renewal_option_terms: z.string().optional().or(z.literal("")),
  early_termination_terms: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type LeaseFormData = z.infer<typeof leaseSchema>;
