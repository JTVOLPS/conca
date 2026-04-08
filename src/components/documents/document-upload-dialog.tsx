"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "@/components/shared/tag-input";
import { FileDropZone } from "@/components/documents/file-drop-zone";
import { DOCUMENT_CATEGORIES } from "@/lib/constants/document-categories";
import { createDocument } from "@/lib/actions/documents";
import { createClient } from "@/lib/supabase/client";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

interface DocumentUploadDialogProps {
  entityType: string;
  entityId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DocumentUploadDialog({
  entityType,
  entityId,
  open,
  onOpenChange,
  onSuccess,
}: DocumentUploadDialogProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFilesSelected(files: File[]) {
    if (files.length > 0) {
      setFile(files[0]);
      setError(null);
    }
  }

  function resetForm() {
    setFile(null);
    setCategory("");
    setTags([]);
    setNotes("");
    setError(null);
    setUploading(false);
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      resetForm();
    }
    onOpenChange(value);
  }

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Get org_id from user's app_metadata
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("Unable to get user information.");
        setUploading(false);
        return;
      }

      const orgId = user.app_metadata?.org_id as string | undefined;
      if (!orgId) {
        setError("Organization information not found.");
        setUploading(false);
        return;
      }

      // Construct storage path
      const storagePath = `${orgId}/${entityType}/${entityId}/${Date.now()}_${file.name}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, file);

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      // Create document record via server action
      const { error: createError } = await createDocument({
        storage_path: storagePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type || "application/octet-stream",
        entity_type: entityType,
        entity_id: entityId,
        category: category || undefined,
        tags,
        notes: notes || undefined,
      });

      if (createError) {
        setError(`Failed to save document record: ${createError}`);
        setUploading(false);
        return;
      }

      handleOpenChange(false);
      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a file and add metadata for organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!file ? (
            <FileDropZone onFilesSelected={handleFilesSelected} />
          ) : (
            <div className="rounded-md border border-border p-3">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="mt-1 text-xs text-muted-foreground hover:text-foreground underline"
              >
                Choose a different file
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <TagInput
              value={tags}
              onChange={setTags}
              placeholder="Add tags..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this document..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
