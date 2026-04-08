"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getNotifications(limit?: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit ?? 20);

  return { data: data ?? [], error: error?.message ?? null };
}

export async function getUnreadCount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { count: 0, error: "Not authenticated" };

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  return { count: count ?? 0, error: error?.message ?? null };
}

export async function markAsRead(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (!error) {
    revalidatePath("/notifications");
  }
  return { error: error?.message ?? null };
}

export async function markAllRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (!error) {
    revalidatePath("/notifications");
  }
  return { error: error?.message ?? null };
}

export async function createNotification(data: {
  orgId: string;
  userId: string;
  type:
    | "task_assigned"
    | "deal_stage_changed"
    | "lease_expiring"
    | "document_uploaded"
    | "commitment_created"
    | "distribution_created";
  title: string;
  body?: string;
  entityType?: string;
  entityId?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("notifications").insert({
    org_id: data.orgId,
    user_id: data.userId,
    type: data.type,
    title: data.title,
    body: data.body || null,
    entity_type: data.entityType || null,
    entity_id: data.entityId || null,
  });

  return { error: error?.message ?? null };
}
