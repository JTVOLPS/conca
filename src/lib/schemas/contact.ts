import { z } from "zod";

export const contactSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  mobile: z.string().optional().or(z.literal("")),
  title: z.string().optional().or(z.literal("")),
  type: z
    .enum([
      "broker",
      "lender",
      "investor",
      "attorney",
      "property_manager",
      "contractor",
      "tenant",
      "partner",
      "other",
    ])
    .nullable()
    .optional(),
  address_line1: z.string().optional().or(z.literal("")),
  address_line2: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  zip: z.string().optional().or(z.literal("")),
  country: z.string().optional().default("US"),
  notes: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).optional().default([]),
  source: z.string().optional().or(z.literal("")),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const contactCompanySchema = z.object({
  contact_id: z.string().uuid(),
  company_id: z.string().uuid(),
  role: z.string().optional().or(z.literal("")),
  is_primary: z.boolean().optional().default(false),
});

export type ContactCompanyFormData = z.infer<typeof contactCompanySchema>;
