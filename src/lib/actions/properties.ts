"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { propertySchema, type PropertyFormData } from "@/lib/schemas/property";

export async function getProperties(options?: {
  search?: string;
  assetClass?: string;
  status?: string;
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

  let query = supabase.from("properties").select("*", { count: "exact" });

  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,city.ilike.%${options.search}%,address_line1.ilike.%${options.search}%`
    );
  }

  if (options?.assetClass) {
    query = query.eq("asset_class", options.assetClass as any);
  }

  if (options?.status) {
    query = query.eq("status", options.status as any);
  }

  const sortBy = options?.sortBy ?? "created_at";
  const sortOrder = options?.sortOrder ?? "desc";
  query = query.order(sortBy, { ascending: sortOrder === "asc" });
  query = query.range(from, to);

  const { data, count, error } = await query;
  return { data: data ?? [], count: count ?? 0, error: error?.message ?? null };
}

export async function getProperty(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("properties")
    .select("*, deals(id, name, stage, asset_class)")
    .eq("id", id)
    .single();

  return { data, error: error?.message ?? null };
}

export async function createProperty(formData: PropertyFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = propertySchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  const { data, error } = await supabase
    .from("properties")
    .insert({
      ...parsed.data,
      org_id: orgId,
      created_by: user.id,
      address_line1: parsed.data.address_line1 || null,
      address_line2: parsed.data.address_line2 || null,
      city: parsed.data.city || null,
      state: parsed.data.state || null,
      zip: parsed.data.zip || null,
      county: parsed.data.county || null,
      zoning: parsed.data.zoning || null,
      parcel_number: parsed.data.parcel_number || null,
      notes: parsed.data.notes || null,
      custom_fields: (parsed.data.custom_fields ?? {}) as any,
    })
    .select()
    .single();

  if (!error) revalidatePath("/properties");
  return { data, error: error?.message ?? null };
}

export async function updateProperty(id: string, formData: PropertyFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = propertySchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from("properties")
    .update({
      ...parsed.data,
      address_line1: parsed.data.address_line1 || null,
      address_line2: parsed.data.address_line2 || null,
      city: parsed.data.city || null,
      state: parsed.data.state || null,
      zip: parsed.data.zip || null,
      county: parsed.data.county || null,
      zoning: parsed.data.zoning || null,
      parcel_number: parsed.data.parcel_number || null,
      notes: parsed.data.notes || null,
      custom_fields: (parsed.data.custom_fields ?? {}) as any,
    } as any)
    .eq("id", id)
    .select()
    .single();

  if (!error) {
    revalidatePath("/properties");
    revalidatePath(`/properties/${id}`);
  }
  return { data, error: error?.message ?? null };
}

export async function deleteProperty(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("properties").delete().eq("id", id);

  if (!error) revalidatePath("/properties");
  return { error: error?.message ?? null };
}
