"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CsvUploaderProps {
  onParsed: (data: Record<string, string>[], headers: string[]) => void;
}

export function CsvUploader({ onParsed }: CsvUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (f: File) => {
      if (!f.name.endsWith(".csv") && f.type !== "text/csv") {
        setError("Please upload a CSV file");
        return;
      }

      setFile(f);
      setError(null);

      Papa.parse(f, {
        header: true,
        skipEmptyLines: true,
        complete(results) {
          if (results.errors.length > 0) {
            setError(`Parse error: ${results.errors[0].message}`);
            return;
          }
          const data = results.data as Record<string, string>[];
          const headers = results.meta.fields ?? [];
          if (data.length === 0) {
            setError("File contains no data rows");
            return;
          }
          onParsed(data, headers);
        },
        error(err) {
          setError(`Failed to parse CSV: ${err.message}`);
        },
      });
    },
    [onParsed]
  );

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".csv";
          input.onchange = () => {
            const f = input.files?.[0];
            if (f) handleFile(f);
          };
          input.click();
        }}
      >
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium">
          Drop your CSV file here or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Only .csv files are supported
        </p>
      </div>

      {file && !error && (
        <div className="flex items-center gap-3 rounded-md border p-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFile(null);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
