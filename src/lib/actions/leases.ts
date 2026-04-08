"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { leaseSchema, type LeaseFormData } from "@/lib/schemas/lease";

export async function getLeases(options?: {
  propertyId?: string;
  tenantId?: string;
  expiresWithinDays?: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], count: 0, error: "Not authenticated" };

  let query = supabase
    .from("leases")
    .select("*, tenants(id, name, email)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (options?.propertyId) {
    query = query.eq("property_id", options.propertyId);
  }

  if (options?.tenantId) {
    query = query.eq("tenant_id", options.tenantId);
  }

  if (options?.expiresWithinDays) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + options.expiresWithinDays);
    query = query
      .gte("end_date", now.toISOString().split("T")[0])
      .lte("end_date", futureDate.toISOString().split("T")[0]);
  }

  const { data, count, error } = await query;
  return { data: data ?? [], count: count ?? 0, error: error?.message ?? null };
}

export async function getLease(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("leases")
    .select("*, tenants(id, name, email, phone)")
    .eq("id", id)
    .single();

  return { data, error: error?.message ?? null };
}

export async function createLease(formData: LeaseFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = leaseSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  const { data, error } = await supabase
    .from("leases")
    .insert({
      ...parsed.data,
      org_id: orgId,
      created_by: user.id,
    } as any)
    .select()
    .single();

  if (!error) revalidatePath(`/properties/${parsed.data.property_id}`);
  return { data, error: error?.message ?? null };
}

export async function updateLease(id: string, formData: LeaseFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = leaseSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from("leases")
    .update({
      ...parsed.data,
    } as any)
    .eq("id", id)
    .select()
    .single();

  if (!error) revalidatePath(`/properties/${parsed.data.property_id}`);
  return { data, error: error?.message ?? null };
}

export async function deleteLease(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Get lease to find property_id for revalidation
  const { data: lease } = await supabase
    .from("leases")
    .select("property_id")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("leases").delete().eq("id", id);

  if (!error && lease) revalidatePath(`/properties/${lease.property_id}`);
  return { error: error?.message ?? null };
}

export async function getExpiringLeases(daysAhead?: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase.rpc("get_expiring_leases", {
    org_id_input: user.app_metadata?.org_id,
    within_days: daysAhead ?? 90,
  });

  return { data: data ?? [], error: error?.message ?? null };
}

export async function getRentRoll(propertyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("v_rent_roll")
    .select("*")
    .eq("property_id", propertyId);

  return { data: data ?? [], error: error?.message ?? null };
}
