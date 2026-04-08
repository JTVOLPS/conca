"use client";

import { ExportButton } from "@/components/shared/export-button";

interface DealsExportWrapperProps {
  deals: Record<string, unknown>[];
}

const DEAL_COLUMNS = [
  { key: "name", header: "Deal Name" },
  { key: "stage", header: "Stage" },
  { key: "asset_class", header: "Asset Class" },
  { key: "created_at", header: "Created At" },
];

export function DealsExportWrapper({ deals }: DealsExportWrapperProps) {
  return (
    <ExportButton
      data={deals}
      filename="deals-export"
      columns={DEAL_COLUMNS}
    />
  );
}
