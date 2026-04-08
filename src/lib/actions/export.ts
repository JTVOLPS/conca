"use server";

import { createClient } from "@/lib/supabase/server";

export async function getExportData(
  entity: "tasks" | "deals" | "properties" | "contacts",
  filters?: Record<string, string>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  switch (entity) {
    case "tasks": {
      let query = supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status as any);
      }
      if (filters?.priority) {
        query = query.eq("priority", filters.priority as any);
      }
      if (filters?.assigned_to) {
        query = query.eq("assigned_to", filters.assigned_to);
      }
      if (filters?.entity_type) {
        query = query.eq("entity_type", filters.entity_type as any);
      }
      if (filters?.entity_id) {
        query = query.eq("entity_id", filters.entity_id);
      }

      const { data, error } = await query;
      return {
        data: (data ?? []) as Record<string, unknown>[],
        error: error?.message ?? null,
      };
    }

    case "deals": {
      let query = supabase
        .from("deals")
        .select(
          "*, properties(id, name), deal_economics(purchase_price, noi, cap_rate_in)"
        )
        .order("created_at", { ascending: false });

      if (filters?.stage) {
        query = query.eq("stage", filters.stage as any);
      }
      if (filters?.asset_class) {
        query = query.eq("asset_class", filters.asset_class as any);
      }

      const { data, error } = await query;
      return {
        data: (data ?? []) as Record<string, unknown>[],
        error: error?.message ?? null,
      };
    }

    case "properties": {
      let query = supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.asset_class) {
        query = query.eq("asset_class", filters.asset_class as any);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status as any);
      }

      const { data, error } = await query;
      return {
        data: (data ?? []) as Record<string, unknown>[],
        error: error?.message ?? null,
      };
    }

    case "contacts": {
      let query = supabase
        .from("contacts")
        .select(
          "*, contact_companies(company_id, role, is_primary, companies(id, name))"
        )
        .order("created_at", { ascending: false });

      if (filters?.type) {
        query = query.eq("type", filters.type as any);
      }

      const { data, error } = await query;
      return {
        data: (data ?? []) as Record<string, unknown>[],
        error: error?.message ?? null,
      };
    }

    default:
      return { data: [], error: `Unknown entity: ${entity}` };
  }
}
