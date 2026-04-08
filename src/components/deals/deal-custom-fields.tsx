"use client";

import { useState, useEffect } from "react";
import { getFieldDefinitions } from "@/lib/actions/deals";

interface FieldDefinition {
  id: string;
  field_key: string;
  field_label: string;
  field_type: string;
  options: string[] | null;
  display_order: number;
  is_required: boolean;
  section: string | null;
}

interface DealCustomFieldsProps {
  assetClass: string;
  values: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
  readOnly?: boolean;
}

export function DealCustomFields({
  assetClass,
  values,
  onChange,
  readOnly = false,
}: DealCustomFieldsProps) {
  const [definitions, setDefinitions] = useState<FieldDefinition[]>([]);

  useEffect(() => {
    if (assetClass && assetClass !== "other") {
      getFieldDefinitions(assetClass).then(({ data }) => {
        setDefinitions(data as FieldDefinition[]);
      });
    } else {
      setDefinitions([]);
    }
  }, [assetClass]);

  if (definitions.length === 0) {
    if (readOnly && Object.keys(values).length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(values).map(([key, val]) => (
            <div key={key}>
              <span className="text-xs text-muted-foreground">{key}</span>
              <p className="text-sm">{String(val)}</p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  }

  // Group by section
  const sections = new Map<string, FieldDefinition[]>();
  for (const def of definitions) {
    const section = def.section ?? "General";
    if (!sections.has(section)) sections.set(section, []);
    sections.get(section)!.push(def);
  }

  function handleChange(key: string, value: unknown) {
    if (onChange) {
      onChange({ ...values, [key]: value });
    }
  }

  return (
    <div className="space-y-4">
      {Array.from(sections.entries()).map(([section, fields]) => (
        <div key={section} className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {section}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {fields.map((def) => (
              <div key={def.field_key}>
                <label className="text-xs text-muted-foreground">
                  {def.field_label}
                  {def.is_required && !readOnly && (
                    <span className="text-destructive"> *</span>
                  )}
                </label>
                {readOnly ? (
                  <p className="text-sm mt-0.5">
                    {renderReadOnlyValue(def, values[def.field_key])}
                  </p>
                ) : (
                  renderInput(def, values[def.field_key], (val) =>
                    handleChange(def.field_key, val)
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function renderReadOnlyValue(
  def: FieldDefinition,
  value: unknown
): string {
  if (value == null || value === "") return "—";
  if (def.field_type === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function renderInput(
  def: FieldDefinition,
  value: unknown,
  onChange: (val: unknown) => void
) {
  const inputClass =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  switch (def.field_type) {
    case "text":
      return (
        <input
          type="text"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      );
    case "number":
      return (
        <input
          type="number"
          step="any"
          value={(value as number) ?? ""}
          onChange={(e) =>
            onChange(e.target.value ? parseFloat(e.target.value) : null)
          }
          className={inputClass}
        />
      );
    case "boolean":
      return (
        <label className="flex items-center gap-2 mt-1">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <span className="text-sm">
            {value ? "Yes" : "No"}
          </span>
        </label>
      );
    case "date":
      return (
        <input
          type="date"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className={inputClass}
        />
      );
    case "select":
      return (
        <select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className={inputClass}
        >
          <option value="">Select...</option>
          {(def.options ?? []).map((opt) => (
            <option key={String(opt)} value={String(opt)}>
              {String(opt)}
            </option>
          ))}
        </select>
      );
    case "textarea":
      return (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      );
    default:
      return (
        <input
          type="text"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      );
  }
}
