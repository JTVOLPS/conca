"use client";

import { useState, useEffect, useCallback } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  FileText,
  Download,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  getDocuments,
  deleteDocument,
  getDocumentDownloadUrl,
} from "@/lib/actions/documents";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface DocumentRow {
  id: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  category: string | null;
  storage_path: string;
  tags: string[] | null;
  notes: string | null;
  created_at: string;
}

interface DocumentsTabProps {
  propertyId: string;
}

function formatFileSize(bytes: number | null): string {
  if (bytes == null) return "---";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsTab({ propertyId }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<DocumentRow | null>(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    const result = await getDocuments({
      entityType: "property",
      entityId: propertyId,
    });
    setDocuments((result.data ?? []) as DocumentRow[]);
    setLoading(false);
  }, [propertyId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteDocument(deleteTarget.id);
    setDeleteTarget(null);
    loadDocuments();
  }

  async function handleDownload(doc: DocumentRow) {
    const result = await getDocumentDownloadUrl(doc.storage_path);
    if (result.data) {
      window.open(result.data, "_blank");
    }
  }

  const columns: ColumnDef<DocumentRow, unknown>[] = [
    {
      accessorKey: "file_name",
      header: "File Name",
      cell: ({ getValue }) => (
        <span className="text-sm font-medium">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ getValue }) => (
        <span className="text-sm">{(getValue() as string) || "---"}</span>
      ),
    },
    {
      accessorKey: "file_size",
      header: "Size",
      cell: ({ getValue }) => (
        <span className="text-sm">
          {formatFileSize(getValue() as number | null)}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Uploaded",
      cell: ({ getValue }) => (
        <span className="text-sm">
          {formatDate(getValue() as string)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(row.original)}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading documents...
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Documents</h3>
        </div>

        {documents.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="No documents"
            description="Documents attached to this property will appear here."
          />
        ) : (
          <DataTable columns={columns} data={documents} />
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Document"
        description={`Are you sure you want to delete "${deleteTarget?.file_name}"?`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
