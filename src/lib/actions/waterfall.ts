"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  waterfallTierSchema,
  type WaterfallTierFormData,
} from "@/lib/schemas/investor";

export async function createWaterfallTier(formData: WaterfallTierFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = waterfallTierSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  const { data, error } = await supabase
    .from("waterfall_tiers")
    .insert({
      ...parsed.data,
      org_id: orgId,
      hurdle_rate: parsed.data.hurdle_rate ?? null,
      lp_split_pct: parsed.data.lp_split_pct ?? null,
      gp_split_pct: parsed.data.gp_split_pct ?? null,
      notes: parsed.data.notes || null,
    } as any)
    .select()
    .single();

  if (!error) {
    revalidatePath(`/deals/${parsed.data.deal_id}`);
  }
  return { data, error: error?.message ?? null };
}

export async function getWaterfallTiers(dealId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("waterfall_tiers")
    .select("*")
    .eq("deal_id", dealId)
    .order("tier_order", { ascending: true });

  return { data: data ?? [], error: error?.message ?? null };
}

export async function updateWaterfallTier(
  id: string,
  formData: WaterfallTierFormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = waterfallTierSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from("waterfall_tiers")
    .update({
      ...parsed.data,
      hurdle_rate: parsed.data.hurdle_rate ?? null,
      lp_split_pct: parsed.data.lp_split_pct ?? null,
      gp_split_pct: parsed.data.gp_split_pct ?? null,
      notes: parsed.data.notes || null,
    } as any)
    .eq("id", id)
    .select()
    .single();

  if (!error) {
    revalidatePath(`/deals/${parsed.data.deal_id}`);
  }
  return { data, error: error?.message ?? null };
}

export async function deleteWaterfallTier(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Get tier to find deal_id for revalidation
  const { data: tier } = await supabase
    .from("waterfall_tiers")
    .select("deal_id")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("waterfall_tiers")
    .delete()
    .eq("id", id);

  if (!error && tier) {
    revalidatePath(`/deals/${tier.deal_id}`);
  }
  return { error: error?.message ?? null };
}

export async function reorderWaterfallTiers(
  dealId: string,
  tierIds: string[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Update each tier's order based on its position in the array
  const updates = tierIds.map((id, index) =>
    supabase
      .from("waterfall_tiers")
      .update({ tier_order: index + 1 })
      .eq("id", id)
      .eq("deal_id", dealId)
  );

  const results = await Promise.all(updates);
  const firstError = results.find((r) => r.error);

  if (!firstError?.error) {
    revalidatePath(`/deals/${dealId}`);
  }
  return { error: firstError?.error?.message ?? null };
}
