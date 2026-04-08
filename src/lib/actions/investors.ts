"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  investorSchema,
  type InvestorFormData,
} from "@/lib/schemas/investor";

function cleanUuidField(value: string | null | undefined): string | null {
  return value && value.trim() !== "" ? value : null;
}

export async function getInvestors() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("investors")
    .select("*, contacts(first_name, last_name), companies(name)")
    .order("name", { ascending: true });

  return { data: data ?? [], error: error?.message ?? null };
}

export async function getInvestor(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("investors")
    .select("*, contacts(first_name, last_name), companies(name)")
    .eq("id", id)
    .single();

  return { data, error: error?.message ?? null };
}

export async function createInvestor(formData: InvestorFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = investorSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  const { data, error } = await supabase
    .from("investors")
    .insert({
      ...parsed.data,
      org_id: orgId,
      created_by: user.id,
      contact_id: cleanUuidField(parsed.data.contact_id),
      company_id: cleanUuidField(parsed.data.company_id),
      tax_id: parsed.data.tax_id || null,
      entity_name: parsed.data.entity_name || null,
      address_line1: parsed.data.address_line1 || null,
      address_city: parsed.data.address_city || null,
      address_state: parsed.data.address_state || null,
      address_zip: parsed.data.address_zip || null,
      notes: parsed.data.notes || null,
    } as any)
    .select()
    .single();

  if (!error) {
    revalidatePath("/investors");
  }
  return { data, error: error?.message ?? null };
}

export async function updateInvestor(id: string, formData: InvestorFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = investorSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from("investors")
    .update({
      ...parsed.data,
      contact_id: cleanUuidField(parsed.data.contact_id),
      company_id: cleanUuidField(parsed.data.company_id),
      tax_id: parsed.data.tax_id || null,
      entity_name: parsed.data.entity_name || null,
      address_line1: parsed.data.address_line1 || null,
      address_city: parsed.data.address_city || null,
      address_state: parsed.data.address_state || null,
      address_zip: parsed.data.address_zip || null,
      notes: parsed.data.notes || null,
    } as any)
    .eq("id", id)
    .select()
    .single();

  if (!error) {
    revalidatePath("/investors");
    revalidatePath(`/investors/${id}`);
  }
  return { data, error: error?.message ?? null };
}

export async function deleteInvestor(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("investors").delete().eq("id", id);

  if (!error) {
    revalidatePath("/investors");
  }
  return { error: error?.message ?? null };
}

export async function searchInvestors(query: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("investors")
    .select("id, name")
    .ilike("name", `%${query}%`)
    .order("name", { ascending: true })
    .limit(20);

  return { data: data ?? [], error: error?.message ?? null };
}
