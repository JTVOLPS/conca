"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, CheckCircle } from "lucide-react";
import Link from "next/link";
import { CsvUploader } from "@/components/csv-import/csv-uploader";
import { ColumnMapper } from "@/components/csv-import/column-mapper";
import { ImportPreview } from "@/components/csv-import/import-preview";
import { importContacts } from "@/lib/actions/csv-import";

const CONTACT_FIELDS = [
  { value: "first_name", label: "First Name", required: true },
  { value: "last_name", label: "Last Name", required: true },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "mobile", label: "Mobile" },
  { value: "title", label: "Job Title" },
  { value: "type", label: "Type" },
  { value: "address_line1", label: "Address Line 1" },
  { value: "address_line2", label: "Address Line 2" },
  { value: "city", label: "City" },
  { value: "state", label: "State" },
  { value: "zip", label: "ZIP" },
  { value: "country", label: "Country" },
  { value: "source", label: "Source" },
  { value: "notes", label: "Notes" },
  { value: "tags", label: "Tags (comma-separated)" },
];

export default function ImportContactsPage() {
  const router = useRouter();
  const [step, setStep] = useState<"upload" | "map" | "preview" | "done">("upload");
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
    errors: Array<{ row: number; message: string }>;
  } | null>(null);

  function handleParsed(data: Record<string, string>[], hdrs: string[]) {
    setCsvData(data);
    setHeaders(hdrs);

    // Auto-map obvious columns
    const autoMap: Record<string, string> = {};
    for (const h of hdrs) {
      const lower = h.toLowerCase().replace(/[^a-z]/g, "");
      for (const f of CONTACT_FIELDS) {
        const fieldLower = f.value.replace(/_/g, "");
        if (lower === fieldLower || lower === f.label.toLowerCase().replace(/[^a-z]/g, "")) {
          autoMap[h] = f.value;
          break;
        }
      }
    }
    setMapping(autoMap);
    setStep("map");
  }

  async function handleImport() {
    setImporting(true);
    const { data, error } = await importContacts(csvData, mapping);
    if (error) {
      alert(error);
      setImporting(false);
      return;
    }
    setResult(data);
    setStep("done");
    setImporting(false);
  }

  const hasRequiredMappings =
    Object.values(mapping).includes("first_name") &&
    Object.values(mapping).includes("last_name");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/contacts"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 w-8 border border-input bg-background hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Import Contacts
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload a CSV file to bulk import contacts
          </p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 text-sm">
        {["Upload", "Map Columns", "Preview & Import"].map((label, i) => {
          const stepKeys = ["upload", "map", "preview"];
          const currentStep = stepKeys.indexOf(step === "done" ? "preview" : step);
          return (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && (
                <div className="h-px w-8 bg-border" />
              )}
              <span
                className={
                  i <= currentStep
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }
              >
                {i + 1}. {label}
              </span>
            </div>
          );
        })}
      </div>

      {step === "upload" && <CsvUploader onParsed={handleParsed} />}

      {step === "map" && (
        <div className="space-y-6">
          <ColumnMapper
            csvHeaders={headers}
            targetFields={CONTACT_FIELDS}
            mapping={mapping}
            onMappingChange={setMapping}
          />
          <div className="flex justify-between">
            <button
              onClick={() => setStep("upload")}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 border border-input bg-background hover:bg-accent"
            >
              Back
            </button>
            <button
              onClick={() => setStep("preview")}
              disabled={!hasRequiredMappings}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-primary text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
            >
              Next: Preview
            </button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-6">
          <ImportPreview data={csvData} mapping={mapping} />
          <div className="rounded-md border p-4 bg-muted/50">
            <p className="text-sm">
              <strong>{csvData.length}</strong> rows will be imported as
              contacts.
            </p>
            {!hasRequiredMappings && (
              <p className="text-sm text-destructive mt-1">
                First Name and Last Name must be mapped.
              </p>
            )}
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => setStep("map")}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 border border-input bg-background hover:bg-accent"
            >
              Back
            </button>
            <button
              onClick={handleImport}
              disabled={importing || !hasRequiredMappings}
              className="inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium h-9 px-4 bg-primary text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {importing ? "Importing..." : `Import ${csvData.length} Contacts`}
            </button>
          </div>
        </div>
      )}

      {step === "done" && result && (
        <div className="space-y-4">
          <div className="rounded-md border p-6 text-center space-y-3">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-lg font-semibold">Import Complete</h2>
            <p className="text-sm text-muted-foreground">
              {result.imported} contacts imported, {result.skipped} skipped
            </p>
          </div>
          {result.errors.length > 0 && (
            <div className="rounded-md border p-4 space-y-2">
              <h3 className="text-sm font-medium text-destructive">
                Errors ({result.errors.length})
              </h3>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    Row {err.row}: {err.message}
                  </p>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={() => router.push("/contacts")}
            className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-primary text-primary-foreground shadow hover:bg-primary/90"
          >
            Go to Contacts
          </button>
        </div>
      )}
    </div>
  );
}
