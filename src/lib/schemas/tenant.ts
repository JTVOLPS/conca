import { z } from "zod";

export const tenantSchema = z.object({
  name: z.string().min(1, "Tenant name is required"),
  property_id: z.string().uuid(),
  contact_id: z.string().uuid().optional().or(z.literal("")),
  unit_label: z.string().optional().or(z.literal("")),
  status: z
    .enum(["active", "expired", "month_to_month", "vacating", "vacated"])
    .optional()
    .default("active"),
  occupied_sf: z.coerce.number().nullable().optional(),
  notes: z.string().optional().or(z.literal("")),
});

export type TenantFormData = z.infer<typeof tenantSchema>;
