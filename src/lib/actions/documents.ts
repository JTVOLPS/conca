"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getDocuments(options?: {
  entityType?: string;
  entityId?: string;
  category?: string;
  search?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], count: 0, error: "Not authenticated" };

  let query = supabase
    .from("documents")
    .select("*", { count: "exact" })
    .order("document_group_id")
    .order("version", { ascending: false });

  if (options?.entityType) {
    query = query.eq(
      "entity_type",
      options.entityType as "deal" | "property" | "contact" | "company"
    );
  }

  if (options?.entityId) {
    query = query.eq("entity_id", options.entityId);
  }

  if (options?.category) {
    query = query.eq("category", options.category as any);
  }

  if (options?.search) {
    query = query.or(
      `file_name.ilike.%${options.search}%,notes.ilike.%${options.search}%`
    );
  }

  const { data, count, error } = await query;

  if (error) {
    return { data: [], count: 0, error: error.message };
  }

  // Filter to keep only the latest version per document_group_id
  const latestByGroup = new Map<string, (typeof data)[number]>();
  for (const doc of data ?? []) {
    const groupId = doc.document_group_id;
    if (!latestByGroup.has(groupId)) {
      latestByGroup.set(groupId, doc);
    }
  }

  const filtered = Array.from(latestByGroup.values());
  return { data: filtered, count: filtered.length, error: null };
}

export async function createDocument(metadata: {
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  entity_type: string;
  entity_id: string;
  category?: string;
  tags?: string[];
  notes?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  // Insert the document; document_group_id will default to the new row's id
  const { data, error } = await supabase
    .from("documents")
    .insert({
      storage_path: metadata.storage_path,
      file_name: metadata.file_name,
      mime_type: metadata.mime_type,
      file_size: metadata.file_size,
      entity_type: metadata.entity_type as any,
      entity_id: metadata.entity_id,
      category: metadata.category || null,
      tags: metadata.tags ?? [],
      notes: metadata.notes || null,
      version: 1,
      org_id: orgId,
      uploaded_by: user.id,
    } as any)
    .select()
    .single();

  if (!error && data) {
    // Set document_group_id to the new row's own id if not set by DB default
    if (!data.document_group_id) {
      await supabase
        .from("documents")
        .update({ document_group_id: data.id } as any)
        .eq("id", data.id);
    }
    revalidatePath("/documents");
  }

  return { data, error: error?.message ?? null };
}

export async function updateDocumentMetadata(
  id: string,
  metadata: {
    category?: string;
    tags?: string[];
    notes?: string;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("documents")
    .update({
      category: metadata.category || null,
      tags: metadata.tags,
      notes: metadata.notes || null,
    } as any)
    .eq("id", id)
    .select()
    .single();

  if (!error) revalidatePath("/documents");
  return { data, error: error?.message ?? null };
}

export async function deleteDocument(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("documents").delete().eq("id", id);

  if (!error) revalidatePath("/documents");
  return { error: error?.message ?? null };
}

export async function getDocumentDownloadUrl(storagePath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(storagePath, 3600);

  return { data: data?.signedUrl ?? null, error: error?.message ?? null };
}

export async function uploadNewVersion(
  documentGroupId: string,
  metadata: {
    storage_path: string;
    file_name: string;
    mime_type: string;
    file_size: number;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  // Get the current max version and entity info for this document group
  const { data: existing, error: fetchError } = await supabase
    .from("documents")
    .select("version, entity_type, entity_id, category, tags")
    .eq("document_group_id", documentGroupId)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  if (fetchError) {
    return { data: null, error: fetchError.message };
  }

  const newVersion = (existing.version ?? 0) + 1;

  const { data, error } = await supabase
    .from("documents")
    .insert({
      document_group_id: documentGroupId,
      storage_path: metadata.storage_path,
      file_name: metadata.file_name,
      mime_type: metadata.mime_type,
      file_size: metadata.file_size,
      entity_type: existing.entity_type,
      entity_id: existing.entity_id,
      category: existing.category,
      tags: existing.tags,
      version: newVersion,
      org_id: orgId,
      uploaded_by: user.id,
    } as any)
    .select()
    .single();

  if (!error) revalidatePath("/documents");
  return { data, error: error?.message ?? null };
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
