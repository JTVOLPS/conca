import { PageHeader } from "@/components/shared/page-header";
import { DocumentList } from "@/components/documents/document-list";
import { getDocuments } from "@/lib/actions/documents";
import type { DocumentRow } from "@/components/documents/document-list";

export default async function DocumentsPage() {
  const { data } = await getDocuments();

  const documents: DocumentRow[] = data.map((doc) => ({
    id: doc.id,
    file_name: doc.file_name,
    mime_type: doc.mime_type,
    file_size: doc.file_size,
    category: doc.category,
    tags: doc.tags,
    notes: doc.notes,
    version: doc.version,
    document_group_id: doc.document_group_id,
    entity_type: doc.entity_type,
    entity_id: doc.entity_id,
    created_at: doc.created_at,
    uploaded_by: doc.uploaded_by,
    storage_path: doc.storage_path,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Browse all uploaded documents across your organization."
      />
      <DocumentList documents={documents} showEntity />
    </div>
  );
}
