"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { companySchema, type CompanyFormData } from "@/lib/schemas/company";

export async function getCompanies(options?: {
  search?: string;
  type?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], count: 0, error: "Not authenticated" };

  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("companies")
    .select("*, contact_companies(contact_id, role, contacts(id, first_name, last_name))", {
      count: "exact",
    });

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
  }

  if (options?.type) {
    query = query.eq("type", options.type as any);
  }

  const sortBy = options?.sortBy ?? "created_at";
  const sortOrder = options?.sortOrder ?? "desc";
  query = query.order(sortBy, { ascending: sortOrder === "asc" });
  query = query.range(from, to);

  const { data, count, error } = await query;
  return { data: data ?? [], count: count ?? 0, error: error?.message ?? null };
}

export async function getCompany(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("companies")
    .select(
      "*, contact_companies(id, contact_id, role, is_primary, contacts(id, first_name, last_name, email, type)), interactions(id, type, subject, body, occurred_at, logged_by)"
    )
    .eq("id", id)
    .single();

  return { data, error: error?.message ?? null };
}

export async function createCompany(formData: CompanyFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = companySchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  const { data, error } = await supabase
    .from("companies")
    .insert({
      ...parsed.data,
      org_id: orgId,
      created_by: user.id,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      website: parsed.data.website || null,
      notes: parsed.data.notes || null,
      address_line1: parsed.data.address_line1 || null,
      address_line2: parsed.data.address_line2 || null,
      city: parsed.data.city || null,
      state: parsed.data.state || null,
      zip: parsed.data.zip || null,
    })
    .select()
    .single();

  if (!error) revalidatePath("/companies");
  return { data, error: error?.message ?? null };
}

export async function updateCompany(id: string, formData: CompanyFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = companySchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from("companies")
    .update({
      ...parsed.data,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      website: parsed.data.website || null,
      notes: parsed.data.notes || null,
      address_line1: parsed.data.address_line1 || null,
      address_line2: parsed.data.address_line2 || null,
      city: parsed.data.city || null,
      state: parsed.data.state || null,
      zip: parsed.data.zip || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (!error) {
    revalidatePath("/companies");
    revalidatePath(`/companies/${id}`);
  }
  return { data, error: error?.message ?? null };
}

export async function deleteCompany(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("companies").delete().eq("id", id);

  if (!error) revalidatePath("/companies");
  return { error: error?.message ?? null };
}
