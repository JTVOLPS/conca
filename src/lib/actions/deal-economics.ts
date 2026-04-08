"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  dealEconomicsSchema,
  type DealEconomicsFormData,
} from "@/lib/schemas/deal-economics";

export async function upsertDealEconomics(formData: DealEconomicsFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = dealEconomicsSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  const { deal_id, ...fields } = parsed.data;

  const { data, error } = await supabase
    .from("deal_economics")
    .upsert(
      {
        deal_id,
        org_id: orgId,
        ...fields,
        custom_fields: (fields.custom_fields ?? {}) as any,
        notes: fields.notes || null,
      } as any,
      { onConflict: "deal_id" }
    )
    .select()
    .single();

  if (!error) revalidatePath(`/deals/${deal_id}`);
  return { data, error: error?.message ?? null };
}

export async function getDealEconomics(dealId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("deal_economics")
    .select("*, companies:lender_id(id, name)")
    .eq("deal_id", dealId)
    .maybeSingle();

  return { data, error: error?.message ?? null };
}
