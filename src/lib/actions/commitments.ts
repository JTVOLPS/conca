"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  commitmentSchema,
  type CommitmentFormData,
} from "@/lib/schemas/investor";

export async function createCommitment(formData: CommitmentFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = commitmentSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  const { data, error } = await supabase
    .from("investor_commitments")
    .insert({
      ...parsed.data,
      org_id: orgId,
      created_by: user.id,
      commitment_date: parsed.data.commitment_date || null,
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

export async function getCommitmentsByDeal(dealId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("investor_commitments")
    .select("*, investors(name)")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false });

  return { data: data ?? [], error: error?.message ?? null };
}

export async function getCommitmentsByInvestor(investorId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("investor_commitments")
    .select("*, deals(name)")
    .eq("investor_id", investorId)
    .order("created_at", { ascending: false });

  return { data: data ?? [], error: error?.message ?? null };
}

export async function updateCommitment(
  id: string,
  formData: CommitmentFormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = commitmentSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from("investor_commitments")
    .update({
      ...parsed.data,
      commitment_date: parsed.data.commitment_date || null,
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

export async function deleteCommitment(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Get commitment to find related ids for revalidation
  const { data: commitment } = await supabase
    .from("investor_commitments")
    .select("investor_id, deal_id")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("investor_commitments")
    .delete()
    .eq("id", id);

  if (!error && commitment) {
    revalidatePath(`/investors/${commitment.investor_id}`);
    revalidatePath(`/deals/${commitment.deal_id}`);
  }
  return { error: error?.message ?? null };
}
