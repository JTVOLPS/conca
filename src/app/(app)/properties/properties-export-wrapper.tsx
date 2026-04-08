"use client";

import { ExportButton } from "@/components/shared/export-button";

interface PropertiesExportWrapperProps {
  properties: Record<string, unknown>[];
}

const PROPERTY_COLUMNS = [
  { key: "name", header: "Property Name" },
  { key: "asset_class", header: "Asset Class" },
  { key: "status", header: "Status" },
  { key: "city", header: "City" },
  { key: "state", header: "State" },
  { key: "total_sf", header: "Total SF" },
  { key: "num_units", header: "Units" },
  { key: "created_at", header: "Created At" },
];

export function PropertiesExportWrapper({
  properties,
}: PropertiesExportWrapperProps) {
  return (
    <ExportButton
      data={properties}
      filename="properties-export"
      columns={PROPERTY_COLUMNS}
    />
  );
}
