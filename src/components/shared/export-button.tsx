"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  columns?: { key: string; header: string }[];
  disabled?: boolean;
}

export function ExportButton({
  data,
  filename,
  columns,
  disabled,
}: ExportButtonProps) {
  async function handleExport() {
    const XLSX = await import("xlsx");

    let sheetData: Record<string, unknown>[];

    if (columns) {
      sheetData = data.map((row) => {
        const mapped: Record<string, unknown> = {};
        for (const col of columns) {
          mapped[col.header] = row[col.key];
        }
        return mapped;
      });
    } else {
      sheetData = data;
    }

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Export");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || data.length === 0}
    >
      <Download className="h-4 w-4" />
      Export
    </Button>
  );
}
