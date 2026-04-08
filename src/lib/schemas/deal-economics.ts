import { z } from "zod";

const optionalNumber = z.coerce.number().nullable().optional();

export const dealEconomicsSchema = z.object({
  deal_id: z.string().uuid(),
  // Purchase
  asking_price: optionalNumber,
  offer_price: optionalNumber,
  purchase_price: optionalNumber,
  price_per_unit: optionalNumber,
  price_per_sf: optionalNumber,
  // Income
  noi: optionalNumber,
  gross_revenue: optionalNumber,
  occupancy_pct: optionalNumber,
  cap_rate_in: optionalNumber,
  cap_rate_out: optionalNumber,
  // Financing
  loan_amount: optionalNumber,
  ltv: optionalNumber,
  interest_rate: optionalNumber,
  loan_term_months: z.coerce.number().int().nullable().optional(),
  lender_id: z.string().uuid().nullable().optional(),
  // Returns
  irr_target: optionalNumber,
  equity_multiple: optionalNumber,
  cash_on_cash: optionalNumber,
  // Equity
  total_equity: optionalNumber,
  sponsor_equity: optionalNumber,
  lp_equity: optionalNumber,
  // Costs
  closing_costs: optionalNumber,
  capex_budget: optionalNumber,
  hold_period_months: z.coerce.number().int().nullable().optional(),
  // Flexible
  custom_fields: z.record(z.unknown()).optional().default({}),
  notes: z.string().optional().or(z.literal("")),
});

export type DealEconomicsFormData = z.infer<typeof dealEconomicsSchema>;
