"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  distributionSchema,
  type DistributionFormData,
} from "@/lib/schemas/investor";

function cleanUuidField(value: string | null | undefined): string | null {
  return value && value.trim() !== "" ? value : null;
}

export async function createDistribution(formData: DistributionFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = distributionSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  const { data, error } = await supabase
    .from("investor_distributions")
    .insert({
      ...parsed.data,
      org_id: orgId,
      created_by: user.id,
      commitment_id: cleanUuidField(parsed.data.commitment_id),
      period_label: parsed.data.period_label || null,
      notes: parsed.data.notes || null,
    } as any)
    .select()
    .single();

  if (!error) {
    revalidatePath(`/investors/${parsed.data.investor_id}`);
    revalidatePath(`/deals/${parsed.data.deal_id}`);
  }
  return { data, error: error?.message ?? null };
}

export async function getDistributionsByDeal(dealId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("investor_distributions")
    .select("*, investors(name)")
    .eq("deal_id", dealId)
    .order("distribution_date", { ascending: false });

  return { data: data ?? [], error: error?.message ?? null };
}

export async function getDistributionsByInvestor(investorId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("investor_distributions")
    .select("*, deals(name)")
    .eq("investor_id", investorId)
    .order("distribution_date", { ascending: false });

  return { data: data ?? [], error: error?.message ?? null };
}

export async function updateDistribution(
  id: string,
  formData: DistributionFormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = distributionSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from("investor_distributions")
    .update({
      ...parsed.data,
      commitment_id: cleanUuidField(parsed.data.commitment_id),
      period_label: parsed.data.period_label || null,
      notes: parsed.data.notes || null,
    } as any)
    .eq("id", id)
    .select()
    .single();

  if (!error) {
    revalidatePath(`/investors/${parsed.data.investor_id}`);
    revalidatePath(`/deals/${parsed.data.deal_id}`);
  }
  return { data, error: error?.message ?? null };
}

export async function deleteDistribution(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Get distribution to find related ids for revalidation
  const { data: distribution } = await supabase
    .from("investor_distributions")
    .select("investor_id, deal_id")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("investor_distributions")
    .delete()
    .eq("id", id);

  if (!error && distribution) {
    revalidatePath(`/investors/${distribution.investor_id}`);
    revalidatePath(`/deals/${distribution.deal_id}`);
  }
  return { error: error?.message ?? null };
}
