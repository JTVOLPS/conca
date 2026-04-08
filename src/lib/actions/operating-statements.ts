"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  operatingStatementSchema,
  type OperatingStatementFormData,
} from "@/lib/schemas/operating-statement";

export async function getOperatingStatements(
  propertyId: string,
  year: number,
  month?: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  let query = supabase
    .from("operating_statements")
    .select("*")
    .eq("property_id", propertyId)
    .eq("period_year", year)
    .order("category")
    .order("line_item");

  if (month !== undefined) {
    query = query.eq("period_month", month);
  }

  const { data, error } = await query;
  return { data: data ?? [], error: error?.message ?? null };
}

export async function upsertOperatingStatement(
  formData: OperatingStatementFormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = operatingStatementSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  const { data, error } = await supabase
    .from("operating_statements")
    .upsert(
      {
        ...parsed.data,
        org_id: orgId,
        notes: parsed.data.notes || null,
      } as any,
      { onConflict: "property_id,year,month,category,line_item" }
    )
    .select()
    .single();

  if (!error) revalidatePath(`/properties/${parsed.data.property_id}`);
  return { data, error: error?.message ?? null };
}

export async function bulkUpsertOperatingStatements(
  propertyId: string,
  year: number,
  month: number,
  items: Array<{
    category: string;
    line_item: string;
    actual_amount?: number | null;
    budget_amount?: number | null;
    notes?: string;
  }>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  const rows = items.map((item) => ({
    property_id: propertyId,
    period_year: year,
    period_month: month,
    category: item.category,
    line_item: item.line_item,
    actual_amount: item.actual_amount ?? null,
    budget_amount: item.budget_amount ?? null,
    notes: item.notes || null,
    org_id: orgId,
  }));

  const { data, error } = await supabase
    .from("operating_statements")
    .upsert(rows as any, {
      onConflict: "property_id,year,month,category,line_item",
    })
    .select();

  if (!error) revalidatePath(`/properties/${propertyId}`);
  return { data: data ?? [], error: error?.message ?? null };
}

export async function deleteOperatingStatement(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Get statement to find property_id for revalidation
  const { data: statement } = await supabase
    .from("operating_statements")
    .select("property_id")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("operating_statements")
    .delete()
    .eq("id", id);

  if (!error && statement)
    revalidatePath(`/properties/${statement.property_id}`);
  return { error: error?.message ?? null };
}

export async function getOperatingSummary(propertyId: string, year: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("operating_statements")
    .select("*")
    .eq("property_id", propertyId)
    .eq("period_year", year);

  if (error) return { data: [], error: error.message };

  // Aggregate by month
  const monthlyMap = new Map<
    number,
    {
      month: number;
      revenue_actual: number;
      revenue_budget: number;
      expense_actual: number;
      expense_budget: number;
      noi_actual: number;
      noi_budget: number;
    }
  >();

  for (const row of data ?? []) {
    if (!monthlyMap.has(row.period_month)) {
      monthlyMap.set(row.period_month, {
        month: row.period_month,
        revenue_actual: 0,
        revenue_budget: 0,
        expense_actual: 0,
        expense_budget: 0,
        noi_actual: 0,
        noi_budget: 0,
      });
    }

    const entry = monthlyMap.get(row.period_month)!;
    const category = (row.category as string).toLowerCase();
    const actual = Number(row.actual_amount) || 0;
    const budget = Number(row.budget_amount) || 0;

    if (category === "revenue" || category === "income") {
      entry.revenue_actual += actual;
      entry.revenue_budget += budget;
    } else {
      entry.expense_actual += actual;
      entry.expense_budget += budget;
    }
  }

  // Compute NOI = revenue - expenses
  const summary = Array.from(monthlyMap.values())
    .map((entry) => ({
      ...entry,
      noi_actual: entry.revenue_actual - entry.expense_actual,
      noi_budget: entry.revenue_budget - entry.expense_budget,
    }))
    .sort((a, b) => a.month - b.month);

  return { data: summary, error: null };
}
