import { z } from "zod";

export const operatingStatementSchema = z.object({
  property_id: z.string().uuid(),
  period_year: z.coerce.number().int(),
  period_month: z.coerce.number().int().min(1).max(12),
  category: z.enum(["revenue", "operating_expense", "capital_expense"]),
  line_item: z.string().min(1, "Line item is required"),
  actual_amount: z.coerce.number().nullable().optional(),
  budget_amount: z.coerce.number().nullable().optional(),
  notes: z.string().optional().or(z.literal("")),
});

export type OperatingStatementFormData = z.infer<
  typeof operatingStatementSchema
>;
