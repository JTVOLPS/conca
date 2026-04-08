"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tenantSchema, type TenantFormData } from "@/lib/schemas/tenant";

export async function getTenants(
  propertyId: string,
  options?: { status?: string; search?: string }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], count: 0, error: "Not authenticated" };

  let query = supabase
    .from("tenants")
    .select("*, leases(id, start_date, end_date, rent_amount, lease_type)", {
      count: "exact",
    })
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status as any);
  }

  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,unit_label.ilike.%${options.search}%`
    );
  }

  const { data, count, error } = await query;
  return { data: data ?? [], count: count ?? 0, error: error?.message ?? null };
}

export async function getTenant(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("tenants")
    .select("*, leases(*)")
    .eq("id", id)
    .single();

  return { data, error: error?.message ?? null };
}

export async function createTenant(formData: TenantFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = tenantSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  const { data, error } = await supabase
    .from("tenants")
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

export async function updateTenant(id: string, formData: TenantFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = tenantSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from("tenants")
    .update({
      ...parsed.data,
    } as any)
    .eq("id", id)
    .select()
    .single();

  if (!error) revalidatePath(`/properties/${parsed.data.property_id}`);
  return { data, error: error?.message ?? null };
}

export async function deleteTenant(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Get tenant to find property_id for revalidation
  const { data: tenant } = await supabase
    .from("tenants")
    .select("property_id")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("tenants").delete().eq("id", id);

  if (!error && tenant) revalidatePath(`/properties/${tenant.property_id}`);
  return { error: error?.message ?? null };
}
