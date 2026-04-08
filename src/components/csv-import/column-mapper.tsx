"use client";

interface ColumnMapperProps {
  csvHeaders: string[];
  targetFields: Array<{ value: string; label: string; required?: boolean }>;
  mapping: Record<string, string>;
  onMappingChange: (mapping: Record<string, string>) => void;
}

export function ColumnMapper({
  csvHeaders,
  targetFields,
  mapping,
  onMappingChange,
}: ColumnMapperProps) {
  function setMapping(csvHeader: string, dbField: string) {
    const newMapping = { ...mapping };
    if (dbField) {
      newMapping[csvHeader] = dbField;
    } else {
      delete newMapping[csvHeader];
    }
    onMappingChange(newMapping);
  }

  const usedFields = new Set(Object.values(mapping));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center text-sm font-medium text-muted-foreground px-1">
        <span>CSV Column</span>
        <span></span>
        <span>Maps to</span>
      </div>
      {csvHeaders.map((header) => (
        <div
          key={header}
          className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center"
        >
          <div className="truncate text-sm rounded-md border bg-muted/50 px-3 py-2">
            {header}
          </div>
          <span className="text-muted-foreground text-sm">→</span>
          <select
            value={mapping[header] ?? ""}
            onChange={(e) => setMapping(header, e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Skip this column</option>
            {targetFields.map((field) => (
              <option
                key={field.value}
                value={field.value}
                disabled={
                  usedFields.has(field.value) &&
                  mapping[header] !== field.value
                }
              >
                {field.label}
                {field.required ? " *" : ""}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
