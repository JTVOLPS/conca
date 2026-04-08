import { z } from "zod";

export const interactionSchema = z.object({
  contact_id: z.string().uuid().nullable().optional(),
  company_id: z.string().uuid().nullable().optional(),
  deal_id: z.string().uuid().nullable().optional(),
  type: z.enum(["call", "email", "meeting", "note", "site_visit", "other"]),
  subject: z.string().optional().or(z.literal("")),
  body: z.string().optional().or(z.literal("")),
  occurred_at: z.string().optional(),
});

export type InteractionFormData = z.infer<typeof interactionSchema>;
