"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  debtInstrumentSchema,
  type DebtInstrumentFormData,
} from "@/lib/schemas/debt-instrument";

function cleanUuidField(value: string | null | undefined): string | null {
  return value && value.trim() !== "" ? value : null;
}

export async function getDebtInstruments(options?: {
  propertyId?: string;
  dealId?: string;
  search?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], count: 0, error: "Not authenticated" };

  let query = supabase
    .from("debt_instruments")
    .select("*, companies:lender_company_id(id, name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (options?.propertyId) {
    query = query.eq("property_id", options.propertyId);
  }

  if (options?.dealId) {
    query = query.eq("deal_id", options.dealId);
  }

  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,loan_number.ilike.%${options.search}%`
    );
  }

  const { data, count, error } = await query;
  return { data: data ?? [], count: count ?? 0, error: error?.message ?? null };
}

export async function getDebtInstrument(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("debt_instruments")
    .select("*, companies:lender_company_id(id, name)")
    .eq("id", id)
    .single();

  return { data, error: error?.message ?? null };
}

export async function createDebtInstrument(formData: DebtInstrumentFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = debtInstrumentSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  const { data, error } = await supabase
    .from("debt_instruments")
    .insert({
      ...parsed.data,
      org_id: orgId,
      created_by: user.id,
      deal_id: cleanUuidField(parsed.data.deal_id),
      lender_company_id: cleanUuidField(parsed.data.lender_company_id),
      notes: parsed.data.notes || null,
    } as any)
    .select()
    .single();

  if (!error) {
    if (parsed.data.property_id)
      revalidatePath(`/properties/${parsed.data.property_id}`);
    if (parsed.data.deal_id)
      revalidatePath(`/deals/${parsed.data.deal_id}`);
  }
  return { data, error: error?.message ?? null };
}

export async function updateDebtInstrument(
  id: string,
  formData: DebtInstrumentFormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = debtInstrumentSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from("debt_instruments")
    .update({
      ...parsed.data,
      deal_id: cleanUuidField(parsed.data.deal_id),
      lender_company_id: cleanUuidField(parsed.data.lender_company_id),
      notes: parsed.data.notes || null,
    } as any)
    .eq("id", id)
    .select()
    .single();

  if (!error) {
    if (parsed.data.property_id)
      revalidatePath(`/properties/${parsed.data.property_id}`);
    if (parsed.data.deal_id)
      revalidatePath(`/deals/${parsed.data.deal_id}`);
  }
  return { data, error: error?.message ?? null };
}

export async function deleteDebtInstrument(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Get instrument to find related ids for revalidation
  const { data: instrument } = await supabase
    .from("debt_instruments")
    .select("property_id, deal_id")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("debt_instruments")
    .delete()
    .eq("id", id);

  if (!error && instrument) {
    if (instrument.property_id)
      revalidatePath(`/properties/${instrument.property_id}`);
    if (instrument.deal_id)
      revalidatePath(`/deals/${instrument.deal_id}`);
  }
  return { error: error?.message ?? null };
}

export async function getDebtMaturitySchedule() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("debt_instruments")
    .select("*, companies:lender_company_id(id, name), properties(id, name)")
    .not("maturity_date", "is", null)
    .order("maturity_date", { ascending: true });

  return { data: data ?? [], error: error?.message ?? null };
}
