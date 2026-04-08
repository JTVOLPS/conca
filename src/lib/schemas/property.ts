import { z } from "zod";

export const propertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  asset_class: z.enum([
    "ios",
    "marina",
    "hospitality",
    "multifamily",
    "transitional",
    "other",
  ]),
  status: z
    .enum(["active", "under_contract", "closed", "disposed", "watch_list"])
    .optional()
    .default("active"),
  address_line1: z.string().optional().or(z.literal("")),
  address_line2: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  zip: z.string().optional().or(z.literal("")),
  county: z.string().optional().or(z.literal("")),
  country: z.string().optional().default("US"),
  latitude: z.coerce.number().nullable().optional(),
  longitude: z.coerce.number().nullable().optional(),
  year_built: z.coerce.number().int().nullable().optional(),
  total_sf: z.coerce.number().nullable().optional(),
  lot_size_acres: z.coerce.number().nullable().optional(),
  num_units: z.coerce.number().int().nullable().optional(),
  zoning: z.string().optional().or(z.literal("")),
  parcel_number: z.string().optional().or(z.literal("")),
  custom_fields: z.record(z.unknown()).optional().default({}),
  notes: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).optional().default([]),
});

export type PropertyFormData = z.infer<typeof propertySchema>;
