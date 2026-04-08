"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

interface ImportResult {
  imported: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
}

export async function importContacts(
  rows: Array<Record<string, string>>,
  columnMapping: Record<string, string>
): Promise<{ data: ImportResult | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  const result: ImportResult = { imported: 0, skipped: 0, errors: [] };
  const validRows: Array<Record<string, unknown>> = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const mapped: Record<string, unknown> = {
      org_id: orgId,
      created_by: user.id,
    };

    for (const [csvCol, dbCol] of Object.entries(columnMapping)) {
      if (dbCol && row[csvCol] !== undefined) {
        const value = row[csvCol].trim();
        if (dbCol === "tags" && value) {
          mapped[dbCol] = value.split(",").map((t: string) => t.trim());
        } else {
          mapped[dbCol] = value || null;
        }
      }
    }

    if (!mapped.first_name || !mapped.last_name) {
      result.errors.push({
        row: i + 1,
        message: "Missing required field: first_name or last_name",
      });
      result.skipped++;
      continue;
    }

    validRows.push(mapped);
  }

  if (validRows.length > 0) {
    // Batch insert in chunks of 100
    const chunkSize = 100;
    for (let i = 0; i < validRows.length; i += chunkSize) {
      const chunk = validRows.slice(i, i + chunkSize);
      const { error } = await supabase.from("contacts").insert(chunk as never[]);
      if (error) {
        result.errors.push({
          row: i + 1,
          message: `Batch insert error: ${error.message}`,
        });
        result.skipped += chunk.length;
      } else {
        result.imported += chunk.length;
      }
    }
  }

  revalidatePath("/contacts");
  return { data: result, error: null };
}

export async function importProperties(
  rows: Array<Record<string, string>>,
  columnMapping: Record<string, string>
): Promise<{ data: ImportResult | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  const result: ImportResult = { imported: 0, skipped: 0, errors: [] };
  const validRows: Array<Record<string, unknown>> = [];

  const numericFields = [
    "latitude",
    "longitude",
    "year_built",
    "total_sf",
    "lot_size_acres",
    "num_units",
  ];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const mapped: Record<string, unknown> = {
      org_id: orgId,
      created_by: user.id,
    };

    for (const [csvCol, dbCol] of Object.entries(columnMapping)) {
      if (dbCol && row[csvCol] !== undefined) {
        const value = row[csvCol].trim();
        if (dbCol === "tags" && value) {
          mapped[dbCol] = value.split(",").map((t: string) => t.trim());
        } else if (numericFields.includes(dbCol) && value) {
          const num = parseFloat(value);
          mapped[dbCol] = isNaN(num) ? null : num;
        } else {
          mapped[dbCol] = value || null;
        }
      }
    }

    if (!mapped.name) {
      result.errors.push({
        row: i + 1,
        message: "Missing required field: name",
      });
      result.skipped++;
      continue;
    }

    if (!mapped.asset_class) {
      mapped.asset_class = "other";
    }

    validRows.push(mapped);
  }

  if (validRows.length > 0) {
    const chunkSize = 100;
    for (let i = 0; i < validRows.length; i += chunkSize) {
      const chunk = validRows.slice(i, i + chunkSize);
      const { error } = await supabase.from("properties").insert(chunk as never[]);
      if (error) {
        result.errors.push({
          row: i + 1,
          message: `Batch insert error: ${error.message}`,
        });
        result.skipped += chunk.length;
      } else {
        result.imported += chunk.length;
      }
    }
  }

  revalidatePath("/properties");
  return { data: result, error: null };
}
