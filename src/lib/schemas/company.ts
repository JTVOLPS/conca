import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  type: z
    .enum([
      "brokerage",
      "lender",
      "investor",
      "developer",
      "property_manager",
      "law_firm",
      "title_company",
      "insurance",
      "contractor",
      "other",
    ])
    .nullable()
    .optional(),
  website: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address_line1: z.string().optional().or(z.literal("")),
  address_line2: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  zip: z.string().optional().or(z.literal("")),
  country: z.string().optional().default("US"),
  notes: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).optional().default([]),
});

export type CompanyFormData = z.infer<typeof companySchema>;
