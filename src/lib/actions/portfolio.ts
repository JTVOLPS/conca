"use server";

import { createClient } from "@/lib/supabase/server";

export async function getPortfolioKPIs() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      aum: null,
      noi: null,
      occupancy: null,
      weightedCapRate: null,
      error: "Not authenticated",
    };

  const [aumResult, noiResult, occupancyResult, capRateResult] =
    await Promise.all([
      supabase.rpc("portfolio_aum"),
      supabase.rpc("portfolio_noi", { p_year: new Date().getFullYear() }),
      supabase.rpc("portfolio_occupancy"),
      supabase.rpc("portfolio_weighted_cap_rate"),
    ]);

  const error =
    aumResult.error?.message ??
    noiResult.error?.message ??
    occupancyResult.error?.message ??
    capRateResult.error?.message ??
    null;

  return {
    aum: aumResult.data,
    noi: noiResult.data,
    occupancy: occupancyResult.data,
    weightedCapRate: capRateResult.data,
    error,
  };
}

export async function getPipelineByStage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase.rpc("pipeline_by_stage");

  return { data: data ?? [], error: error?.message ?? null };
}

export async function getDebtMaturityLadder() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase.rpc("debt_maturity_ladder");

  return { data: data ?? [], error: error?.message ?? null };
}

export async function getActivityByUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  // Fetch interactions and user profiles separately (FK goes to auth.users, not user_profiles)
  const [interactionsResult, profilesResult] = await Promise.all([
    supabase.from("interactions").select("logged_by"),
    supabase.from("user_profiles").select("id, full_name"),
  ]);

  if (interactionsResult.error)
    return { data: [], error: interactionsResult.error.message };

  const profileMap = new Map(
    (profilesResult.data ?? []).map((p) => [p.id, p.full_name])
  );

  // Group by user
  const grouped = (interactionsResult.data ?? []).reduce(
    (acc: Record<string, { userId: string; fullName: string; count: number }>, row) => {
      const userId = row.logged_by;
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          fullName: profileMap.get(userId) ?? "Unknown",
          count: 0,
        };
      }
      acc[userId].count += 1;
      return acc;
    },
    {} as Record<string, { userId: string; fullName: string; count: number }>
  );

  return {
    data: Object.values(grouped) as Array<{
      userId: string;
      fullName: string;
      count: number;
    }>,
    error: null,
  };
}
