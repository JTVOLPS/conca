"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Image,
  Sheet,
  File,
  Download,
  Trash2,
  History,
  Upload,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable, SortableHeader } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { DocumentUploadDialog } from "@/components/documents/document-upload-dialog";
import { DocumentVersionHistory } from "@/components/documents/document-version-history";
import { DOCUMENT_CATEGORY_MAP } from "@/lib/constants/document-categories";
import {
  deleteDocument,
  getDocumentDownloadUrl,
} from "@/lib/actions/documents";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DocumentRow {
  id: string;
  file_name: string;
  mime_type: string | null;
  file_size: number | null;
  category: string | null;
  tags: string[];
  notes: string | null;
  version: number;
  document_group_id: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  uploaded_by: string | null;
  storage_path: string;
}

interface DocumentListProps {
  entityType?: string;
  entityId?: string;
  documents: DocumentRow[];
  showEntity?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function FileTypeIcon({ mimeType }: { mimeType: string | null }) {
  if (!mimeType) return <File className="h-4 w-4 text-muted-foreground" />;
  if (mimeType === "application/pdf")
    return <FileText className="h-4 w-4 text-red-500" />;
  if (mimeType.startsWith("image/"))
    return <Image className="h-4 w-4 text-violet-500" />;
  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    mimeType === "text/csv"
  )
    return <Sheet className="h-4 w-4 text-emerald-500" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DocumentList({
  entityType,
  entityId,
  documents,
  showEntity = false,
}: DocumentListProps) {
  const router = useRouter();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DocumentRow | null>(null);
  const [versionTarget, setVersionTarget] = useState<string | null>(null);

  async function handleDownload(doc: DocumentRow) {
    const { url, error } = await getDocumentDownloadUrl(doc.storage_path);
    if (error || !url) return;
    window.open(url, "_blank");
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    // Delete from database
    await deleteDocument(deleteTarget.id);

    // Delete from storage
    const supabase = createClient();
    await supabase.storage
      .from("documents")
      .remove([deleteTarget.storage_path]);

    setDeleteTarget(null);
    router.refresh();
  }

  const columns = useMemo(() => {
    const cols: ColumnDef<DocumentRow, unknown>[] = [
      {
        accessorKey: "file_name",
        header: ({ column }) => (
          <SortableHeader column={column}>File Name</SortableHeader>
        ),
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <button
              type="button"
              onClick={() => handleDownload(doc)}
              className="flex items-center gap-2 text-left hover:underline"
            >
              <FileTypeIcon mimeType={doc.mime_type} />
              <span className="truncate max-w-[200px] text-sm font-medium">
                {doc.file_name}
              </span>
            </button>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
          const category = row.original.category;
          if (!category) return <span className="text-muted-foreground">--</span>;
          const cat = DOCUMENT_CATEGORY_MAP[category as keyof typeof DOCUMENT_CATEGORY_MAP];
          if (!cat)
            return (
              <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium">
                {category}
              </span>
            );
          return (
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                cat.color
              )}
            >
              {cat.label}
            </span>
          );
        },
      },
      {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }) => {
          const tags = row.original.tags;
          if (!tags || tags.length === 0)
            return <span className="text-muted-foreground">--</span>;
          const displayed = tags.slice(0, 3);
          const remaining = tags.length - displayed.length;
          return (
            <div className="flex flex-wrap gap-1">
              {displayed.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
              {remaining > 0 && (
                <span className="text-xs text-muted-foreground">
                  +{remaining}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "version",
        header: "Version",
        cell: ({ row }) => {
          const version = row.original.version;
          if (version <= 1) return null;
          return (
            <span className="text-xs text-muted-foreground">v{version}</span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <SortableHeader column={column}>Uploaded</SortableHeader>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatRelativeDate(row.original.created_at)}
          </span>
        ),
      },
      {
        accessorKey: "file_size",
        header: "Size",
        cell: ({ row }) => {
          const size = row.original.file_size;
          if (size == null)
            return <span className="text-muted-foreground">--</span>;
          return (
            <span className="text-sm text-muted-foreground">
              {formatFileSize(size)}
            </span>
          );
        },
      },
    ];

    if (showEntity) {
      cols.splice(1, 0, {
        accessorKey: "entity_type",
        header: "Entity",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <span className="text-sm capitalize">
              {doc.entity_type}
            </span>
          );
        },
      });
    }

    // Actions column always goes last
    cols.push({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const doc = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            {doc.version > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setVersionTarget(doc.document_group_id)}
                title="Version history"
              >
                <History className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDownload(doc)}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteTarget(doc)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    });

    return cols;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEntity]);

  const canUpload = entityType && entityId;

  return (
    <div className="space-y-4">
      {canUpload && (
        <div className="flex justify-end">
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
      )}

      {documents.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-5 w-5" />}
          title="No documents"
          description={
            canUpload
              ? "Upload your first document to get started."
              : "No documents have been uploaded yet."
          }
          action={
            canUpload ? (
              <Button onClick={() => setUploadOpen(true)}>
                <Upload className="h-4 w-4" />
                Upload Document
              </Button>
            ) : undefined
          }
        />
      ) : (
        <DataTable columns={columns} data={documents} />
      )}

      {canUpload && (
        <DocumentUploadDialog
          entityType={entityType}
          entityId={entityId}
          open={uploadOpen}
          onOpenChange={setUploadOpen}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Document"
        description={`Are you sure you want to delete "${deleteTarget?.file_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />

      {versionTarget && (
        <DocumentVersionHistory
          documentGroupId={versionTarget}
          open={versionTarget !== null}
          onOpenChange={(open) => {
            if (!open) setVersionTarget(null);
          }}
        />
      )}
    </div>
  );
}
