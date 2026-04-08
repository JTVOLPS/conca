"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  interactionSchema,
  type InteractionFormData,
} from "@/lib/schemas/interaction";

export async function createInteraction(formData: InteractionFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = interactionSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  const { data, error } = await supabase
    .from("interactions")
    .insert({
      org_id: orgId,
      logged_by: user.id,
      contact_id: parsed.data.contact_id || null,
      company_id: parsed.data.company_id || null,
      deal_id: parsed.data.deal_id || null,
      type: parsed.data.type,
      subject: parsed.data.subject || null,
      body: parsed.data.body || null,
      occurred_at: parsed.data.occurred_at || new Date().toISOString(),
    })
    .select()
    .single();

  if (!error) {
    if (parsed.data.contact_id)
      revalidatePath(`/contacts/${parsed.data.contact_id}`);
    if (parsed.data.company_id)
      revalidatePath(`/companies/${parsed.data.company_id}`);
    if (parsed.data.deal_id)
      revalidatePath(`/deals/${parsed.data.deal_id}`);
  }

  return { data, error: error?.message ?? null };
}

export async function getInteractions(options: {
  contactId?: string;
  companyId?: string;
  dealId?: string;
  limit?: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  let query = supabase
    .from("interactions")
    .select("*, contacts(first_name, last_name)")
    .order("occurred_at", { ascending: false })
    .limit(options.limit ?? 50);

  if (options.contactId) {
    query = query.eq("contact_id", options.contactId);
  }
  if (options.companyId) {
    query = query.eq("company_id", options.companyId);
  }
  if (options.dealId) {
    query = query.eq("deal_id", options.dealId);
  }

  const { data, error } = await query;
  return { data: data ?? [], error: error?.message ?? null };
}

export async function deleteInteraction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("interactions")
    .delete()
    .eq("id", id);

  return { error: error?.message ?? null };
}
