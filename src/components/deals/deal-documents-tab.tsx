"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentList } from "@/components/documents/document-list";
import { DocumentUploadDialog } from "@/components/documents/document-upload-dialog";
import { getDocuments } from "@/lib/actions/documents";
import type { DocumentRow } from "@/components/documents/document-list";

interface DealDocumentsTabProps {
  dealId: string;
}

export function DealDocumentsTab({ dealId }: DealDocumentsTabProps) {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    const result = await getDocuments({
      entityType: "deal",
      entityId: dealId,
    });
    if (result.error) {
      setError(result.error);
    } else {
      setDocuments(result.data as DocumentRow[]);
    }
    setLoading(false);
  }, [dealId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <DocumentList
        entityType="deal"
        entityId={dealId}
        documents={documents}
      />

      <DocumentUploadDialog
        entityType="deal"
        entityId={dealId}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSuccess={fetchDocuments}
      />
    </div>
  );
}
