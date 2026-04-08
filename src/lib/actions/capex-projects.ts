"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  capexProjectSchema,
  type CapexProjectFormData,
} from "@/lib/schemas/capex-project";

function cleanUuidField(value: string | null | undefined): string | null {
  return value && value.trim() !== "" ? value : null;
}

export async function getCapexProjects(options?: {
  propertyId?: string;
  dealId?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
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
    .from("capex_projects")
    .select("*, properties(id, name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (options?.propertyId) {
    query = query.eq("property_id", options.propertyId);
  }

  if (options?.dealId) {
    query = query.eq("deal_id", options.dealId);
  }

  if (options?.status) {
    query = query.eq("status", options.status as any);
  }

  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,description.ilike.%${options.search}%`
    );
  }

  query = query.range(from, to);

  const { data, count, error } = await query;
  return { data: data ?? [], count: count ?? 0, error: error?.message ?? null };
}

export async function getCapexProject(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("capex_projects")
    .select("*, properties(id, name)")
    .eq("id", id)
    .single();

  return { data, error: error?.message ?? null };
}

export async function createCapexProject(formData: CapexProjectFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = capexProjectSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  const { data, error } = await supabase
    .from("capex_projects")
    .insert({
      ...parsed.data,
      org_id: orgId,
      created_by: user.id,
      deal_id: cleanUuidField(parsed.data.deal_id),
      contractor_contact_id: cleanUuidField(parsed.data.contractor_contact_id),
      notes: parsed.data.notes || null,
    } as any)
    .select()
    .single();

  if (!error) {
    revalidatePath(`/properties/${parsed.data.property_id}`);
    if (parsed.data.deal_id)
      revalidatePath(`/deals/${parsed.data.deal_id}`);
  }
  return { data, error: error?.message ?? null };
}

export async function updateCapexProject(
  id: string,
  formData: CapexProjectFormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = capexProjectSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from("capex_projects")
    .update({
      ...parsed.data,
      deal_id: cleanUuidField(parsed.data.deal_id),
      contractor_contact_id: cleanUuidField(parsed.data.contractor_contact_id),
      notes: parsed.data.notes || null,
    } as any)
    .eq("id", id)
    .select()
    .single();

  if (!error) {
    revalidatePath(`/properties/${parsed.data.property_id}`);
    if (parsed.data.deal_id)
      revalidatePath(`/deals/${parsed.data.deal_id}`);
  }
  return { data, error: error?.message ?? null };
}

export async function deleteCapexProject(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Get project to find property_id for revalidation
  const { data: project } = await supabase
    .from("capex_projects")
    .select("property_id, deal_id")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("capex_projects")
    .delete()
    .eq("id", id);

  if (!error && project) {
    revalidatePath(`/properties/${project.property_id}`);
    if (project.deal_id) revalidatePath(`/deals/${project.deal_id}`);
  }
  return { error: error?.message ?? null };
}
