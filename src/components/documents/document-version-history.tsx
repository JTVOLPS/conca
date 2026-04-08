"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  getDocumentVersions,
  getDocumentDownloadUrl,
} from "@/lib/actions/documents";

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

interface VersionRow {
  id: string;
  file_name: string;
  file_size: number | null;
  version: number;
  created_at: string;
  storage_path: string;
}

interface DocumentVersionHistoryProps {
  documentGroupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentVersionHistory({
  documentGroupId,
  open,
  onOpenChange,
}: DocumentVersionHistoryProps) {
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    async function fetchVersions() {
      setLoading(true);
      setError(null);
      const result = await getDocumentVersions(documentGroupId);
      if (result.error) {
        setError(result.error);
      } else {
        setVersions(
          result.data.map((d) => ({
            id: d.id,
            file_name: d.file_name,
            file_size: d.file_size,
            version: d.version,
            created_at: d.created_at,
            storage_path: d.storage_path,
          }))
        );
      }
      setLoading(false);
    }

    fetchVersions();
  }, [open, documentGroupId]);

  async function handleDownload(storagePath: string) {
    const { data: url, error: dlError } =
      await getDocumentDownloadUrl(storagePath);
    if (dlError || !url) {
      return;
    }
    window.open(url, "_blank");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            All versions of this document.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {!loading &&
            !error &&
            versions.map((version, index) => (
              <div
                key={version.id}
                className={`flex items-center justify-between rounded-md border p-3 ${
                  index === 0 ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      v{version.version}
                    </span>
                    {index === 0 && (
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {version.file_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {version.file_size != null
                      ? formatFileSize(version.file_size)
                      : "Unknown size"}{" "}
                    &middot; {formatRelativeDate(version.created_at)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(version.storage_path)}
                  title="Download this version"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}

          {!loading && !error && versions.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No versions found.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
