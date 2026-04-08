"use server";

import { createClient } from "@/lib/supabase/server";

export interface SearchResult {
  id: string;
  entity_type: string;
  title: string;
  subtitle: string;
  rank: number;
}

export async function globalSearch(
  query: string
): Promise<{ data: SearchResult[]; error: string | null }> {
  if (!query || query.trim().length < 2) {
    return { data: [], error: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase.rpc("global_search", {
    search_query: query.trim(),
    result_limit: 20,
  });

  return {
    data: (data as SearchResult[]) ?? [],
    error: error?.message ?? null,
  };
}
