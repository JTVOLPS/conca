import { z } from "zod";

export const capexProjectSchema = z.object({
  property_id: z.string().uuid(),
  deal_id: z.string().uuid().optional().or(z.literal("")),
  name: z.string().min(1, "Project name is required"),
  status: z
    .enum(["planned", "in_progress", "completed", "on_hold", "cancelled"])
    .optional()
    .default("planned"),
  budget_amount: z.coerce.number().nullable().optional(),
  spent_amount: z.coerce.number().nullable().optional(),
  start_date: z.string().optional().or(z.literal("")),
  target_completion_date: z.string().optional().or(z.literal("")),
  actual_completion_date: z.string().optional().or(z.literal("")),
  contractor: z.string().optional().or(z.literal("")),
  contractor_contact_id: z.string().uuid().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type CapexProjectFormData = z.infer<typeof capexProjectSchema>;
