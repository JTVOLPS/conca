import { z } from "zod";

export const documentSchema = z.object({
  entity_type: z.enum(["deal", "property", "contact", "company"]),
  entity_id: z.string().uuid(),
  category: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().optional().or(z.literal("")),
});

export type DocumentFormData = z.infer<typeof documentSchema>;
