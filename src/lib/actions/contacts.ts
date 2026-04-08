"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { contactSchema, type ContactFormData } from "@/lib/schemas/contact";

export async function getContacts(options?: {
  search?: string;
  type?: string;
  tag?: string;
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
    .from("contacts")
    .select("*, contact_companies(company_id, role, is_primary, companies(id, name))", {
      count: "exact",
    });

  if (options?.search) {
    query = query.or(
      `first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,email.ilike.%${options.search}%`
    );
  }

  if (options?.type) {
    query = query.eq("type", options.type as any);
  }

  if (options?.tag) {
    query = query.contains("tags", [options.tag]);
  }

  const sortBy = options?.sortBy ?? "created_at";
  const sortOrder = options?.sortOrder ?? "desc";
  query = query.order(sortBy, { ascending: sortOrder === "asc" });
  query = query.range(from, to);

  const { data, count, error } = await query;
  return { data: data ?? [], count: count ?? 0, error: error?.message ?? null };
}

export async function getContact(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("contacts")
    .select(
      "*, contact_companies(id, company_id, role, is_primary, companies(id, name, type)), interactions(id, type, subject, body, occurred_at, logged_by)"
    )
    .eq("id", id)
    .single();

  return { data, error: error?.message ?? null };
}

export async function createContact(formData: ContactFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = contactSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      ...parsed.data,
      org_id: orgId,
      created_by: user.id,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      mobile: parsed.data.mobile || null,
      title: parsed.data.title || null,
      source: parsed.data.source || null,
      notes: parsed.data.notes || null,
      address_line1: parsed.data.address_line1 || null,
      address_line2: parsed.data.address_line2 || null,
      city: parsed.data.city || null,
      state: parsed.data.state || null,
      zip: parsed.data.zip || null,
    })
    .select()
    .single();

  if (!error) revalidatePath("/contacts");
  return { data, error: error?.message ?? null };
}

export async function updateContact(id: string, formData: ContactFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = contactSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from("contacts")
    .update({
      ...parsed.data,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      mobile: parsed.data.mobile || null,
      title: parsed.data.title || null,
      source: parsed.data.source || null,
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
    revalidatePath("/contacts");
    revalidatePath(`/contacts/${id}`);
  }
  return { data, error: error?.message ?? null };
}

export async function deleteContact(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("contacts").delete().eq("id", id);

  if (!error) revalidatePath("/contacts");
  return { error: error?.message ?? null };
}

export async function linkContactCompany(
  contactId: string,
  companyId: string,
  role?: string,
  isPrimary?: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("contact_companies").insert({
    contact_id: contactId,
    company_id: companyId,
    role: role || null,
    is_primary: isPrimary ?? false,
  });

  if (!error) {
    revalidatePath(`/contacts/${contactId}`);
    revalidatePath(`/companies/${companyId}`);
  }
  return { error: error?.message ?? null };
}

export async function unlinkContactCompany(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("contact_companies")
    .delete()
    .eq("id", id);

  if (!error) revalidatePath("/contacts");
  return { error: error?.message ?? null };
}
