"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { dealSchema, type DealFormData } from "@/lib/schemas/deal";
import type { DealStage } from "@/lib/constants/deal-stages";
import { notifyDealStageChanged } from "@/lib/actions/notification-triggers";

export async function getDeals(options?: {
  search?: string;
  stage?: string;
  assetClass?: string;
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
  const pageSize = options?.pageSize ?? 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("deals")
    .select(
      "*, properties(id, name, city, state), deal_economics(purchase_price, noi, cap_rate_in)",
      { count: "exact" }
    );

  if (options?.search) {
    query = query.ilike("name", `%${options.search}%`);
  }

  if (options?.stage) {
    query = query.eq("stage", options.stage as any);
  }

  if (options?.assetClass) {
    query = query.eq("asset_class", options.assetClass as any);
  }

  const sortBy = options?.sortBy ?? "created_at";
  const sortOrder = options?.sortOrder ?? "desc";
  query = query.order(sortBy, { ascending: sortOrder === "asc" });
  query = query.range(from, to);

  const { data, count, error } = await query;
  return { data: data ?? [], count: count ?? 0, error: error?.message ?? null };
}

export async function getDealsByStage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("deals")
    .select(
      "*, properties(id, name, city, state), deal_economics(purchase_price, noi, cap_rate_in)"
    )
    .order("stage_position", { ascending: true });

  return { data: data ?? [], error: error?.message ?? null };
}

export async function getDeal(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("deals")
    .select(
      `*,
      properties(id, name, city, state, asset_class),
      deal_economics(*),
      deal_contacts(id, contact_id, role, contacts(id, first_name, last_name, email, type)),
      deal_stage_history(id, from_stage, to_stage, changed_by, changed_at),
      interactions(id, type, subject, body, occurred_at, logged_by)`
    )
    .eq("id", id)
    .single();

  return { data, error: error?.message ?? null };
}

export async function createDeal(formData: DealFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = dealSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  const stage = parsed.data.stage ?? "sourcing";

  const { data, error } = await supabase
    .from("deals")
    .insert({
      name: parsed.data.name,
      asset_class: parsed.data.asset_class,
      stage,
      org_id: orgId,
      created_by: user.id,
      property_id: parsed.data.property_id || null,
      lead_broker_id: parsed.data.lead_broker_id || null,
      lead_source: parsed.data.lead_source || null,
      assigned_to: parsed.data.assigned_to || null,
      description: parsed.data.description || null,
      notes: parsed.data.notes || null,
      tags: parsed.data.tags ?? [],
      custom_fields: (parsed.data.custom_fields ?? {}) as any,
      sourced_at: parsed.data.sourced_at || null,
      loi_submitted_at: parsed.data.loi_submitted_at || null,
      loi_accepted_at: parsed.data.loi_accepted_at || null,
      contract_date: parsed.data.contract_date || null,
      due_diligence_start: parsed.data.due_diligence_start || null,
      due_diligence_end: parsed.data.due_diligence_end || null,
      closing_date: parsed.data.closing_date || null,
      dead_at: parsed.data.dead_at || null,
      dead_reason: parsed.data.dead_reason || null,
    })
    .select()
    .single();

  if (data && !error) {
    // Log initial stage
    await supabase.from("deal_stage_history").insert({
      deal_id: data.id,
      org_id: orgId,
      from_stage: null,
      to_stage: stage,
      changed_by: user.id,
    });
    revalidatePath("/deals");
  }

  return { data, error: error?.message ?? null };
}

export async function updateDeal(id: string, formData: DealFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = dealSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  // Check if stage changed
  const { data: currentDeal } = await supabase
    .from("deals")
    .select("stage, org_id")
    .eq("id", id)
    .single();

  const stageChanged = currentDeal && parsed.data.stage !== currentDeal.stage;

  const { data, error } = await supabase
    .from("deals")
    .update({
      name: parsed.data.name,
      asset_class: parsed.data.asset_class,
      stage: parsed.data.stage,
      property_id: parsed.data.property_id || null,
      lead_broker_id: parsed.data.lead_broker_id || null,
      lead_source: parsed.data.lead_source || null,
      assigned_to: parsed.data.assigned_to || null,
      description: parsed.data.description || null,
      notes: parsed.data.notes || null,
      tags: parsed.data.tags ?? [],
      custom_fields: (parsed.data.custom_fields ?? {}) as any,
      sourced_at: parsed.data.sourced_at || null,
      loi_submitted_at: parsed.data.loi_submitted_at || null,
      loi_accepted_at: parsed.data.loi_accepted_at || null,
      contract_date: parsed.data.contract_date || null,
      due_diligence_start: parsed.data.due_diligence_start || null,
      due_diligence_end: parsed.data.due_diligence_end || null,
      closing_date: parsed.data.closing_date || null,
      dead_at: parsed.data.dead_at || null,
      dead_reason: parsed.data.dead_reason || null,
      ...(stageChanged ? { stage_changed_at: new Date().toISOString() } : {}),
    })
    .eq("id", id)
    .select()
    .single();

  if (!error && stageChanged && currentDeal) {
    await supabase.from("deal_stage_history").insert({
      deal_id: id,
      org_id: currentDeal.org_id,
      from_stage: currentDeal.stage,
      to_stage: parsed.data.stage!,
      changed_by: user.id,
    });
  }

  if (!error) {
    revalidatePath("/deals");
    revalidatePath(`/deals/${id}`);
  }
  return { data, error: error?.message ?? null };
}

export async function updateDealStage(
  dealId: string,
  newStage: DealStage,
  newPosition: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: currentDeal } = await supabase
    .from("deals")
    .select("stage, org_id, name, assigned_to")
    .eq("id", dealId)
    .single();

  if (!currentDeal) return { error: "Deal not found" };

  const { error } = await supabase
    .from("deals")
    .update({
      stage: newStage,
      stage_position: newPosition,
      stage_changed_at: new Date().toISOString(),
    })
    .eq("id", dealId);

  if (!error && currentDeal.stage !== newStage) {
    await supabase.from("deal_stage_history").insert({
      deal_id: dealId,
      org_id: currentDeal.org_id,
      from_stage: currentDeal.stage,
      to_stage: newStage,
      changed_by: user.id,
    });

    // Notify the deal's assigned user about the stage change
    if (currentDeal.assigned_to && currentDeal.assigned_to !== user.id) {
      try {
        const { data: changerProfile } = await supabase
          .from("user_profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        notifyDealStageChanged(
          currentDeal.org_id,
          dealId,
          currentDeal.name,
          currentDeal.assigned_to,
          currentDeal.stage,
          newStage,
          changerProfile?.full_name ?? "Someone"
        );
      } catch {
        // Notification should not block deal stage update
      }
    }
  }

  if (!error) revalidatePath("/deals");
  return { error: error?.message ?? null };
}

export async function deleteDeal(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("deals").delete().eq("id", id);

  if (!error) revalidatePath("/deals");
  return { error: error?.message ?? null };
}

export async function linkDealContact(
  dealId: string,
  contactId: string,
  role?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("deal_contacts").insert({
    deal_id: dealId,
    contact_id: contactId,
    role: role || null,
  });

  if (!error) revalidatePath(`/deals/${dealId}`);
  return { error: error?.message ?? null };
}

export async function unlinkDealContact(id: string, dealId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("deal_contacts").delete().eq("id", id);

  if (!error) revalidatePath(`/deals/${dealId}`);
  return { error: error?.message ?? null };
}

export async function getFieldDefinitions(assetClass: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deal_field_definitions")
    .select("*")
    .eq("asset_class", assetClass)
    .order("display_order", { ascending: true });

  return { data: data ?? [], error: error?.message ?? null };
}
