"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getDocuments(options?: {
  entityType?: string;
  entityId?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  let query = supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (options?.entityType) {
    query = query.eq("entity_type", options.entityType as "deal" | "property" | "contact" | "company");
  }

  if (options?.entityId) {
    query = query.eq("entity_id", options.entityId);
  }

  const { data, error } = await query;
  return { data: data ?? [], error: error?.message ?? null };
}

export async function createDocument(metadata: {
  storage_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  entity_type: "deal" | "property" | "contact" | "company";
  entity_id: string;
  category: string | null;
  tags: string[];
  notes: string | null;
  document_group_id: string;
  org_id: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("documents")
    .insert({
      ...metadata,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (!error) {
    revalidatePath("/documents");
  }

  return { data, error: error?.message ?? null };
}

export async function deleteDocument(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("documents").delete().eq("id", id);

  if (!error) {
    revalidatePath("/documents");
  }

  return { error: error?.message ?? null };
}

export async function getDocumentVersions(documentGroupId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("document_group_id", documentGroupId)
    .order("version", { ascending: false });

  return { data: data ?? [], error: error?.message ?? null };
}

export async function getDocumentDownloadUrl(storagePath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { url: null, error: "Not authenticated" };

  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(storagePath, 3600);

  return { url: data?.signedUrl ?? null, error: error?.message ?? null };
}
