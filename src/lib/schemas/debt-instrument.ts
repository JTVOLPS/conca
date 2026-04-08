import { z } from "zod";

export const debtInstrumentSchema = z.object({
  property_id: z.string().uuid().optional().or(z.literal("")),
  deal_id: z.string().uuid().optional().or(z.literal("")),
  lender_company_id: z.string().uuid().optional().or(z.literal("")),
  loan_name: z.string().min(1, "Loan name is required"),
  loan_type: z.enum([
    "permanent",
    "bridge",
    "construction",
    "mezzanine",
    "line_of_credit",
    "other",
  ]),
  original_amount: z.coerce.number().nullable().optional(),
  current_balance: z.coerce.number().nullable().optional(),
  interest_rate: z.coerce.number().nullable().optional(),
  rate_type: z
    .enum(["fixed", "floating", "hybrid"])
    .optional()
    .default("fixed"),
  spread_over_index: z.coerce.number().nullable().optional(),
  index_name: z.string().optional().or(z.literal("")),
  origination_date: z.string().optional().or(z.literal("")),
  maturity_date: z.string().optional().or(z.literal("")),
  io_period_months: z.coerce.number().int().nullable().optional(),
  amortization_months: z.coerce.number().int().nullable().optional(),
  annual_debt_service: z.coerce.number().nullable().optional(),
  dscr: z.coerce.number().nullable().optional(),
  ltv_current: z.coerce.number().nullable().optional(),
  prepayment_terms: z.string().optional().or(z.literal("")),
  covenants: z.record(z.unknown()).optional().default({}),
  recourse: z
    .enum(["full", "partial", "non_recourse"])
    .optional()
    .or(z.literal("")),
  guarantor: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type DebtInstrumentFormData = z.infer<typeof debtInstrumentSchema>;
