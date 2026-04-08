export const DOCUMENT_CATEGORIES = [
  { value: "loi", label: "LOI", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "psa", label: "PSA / Purchase Agreement", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { value: "appraisal", label: "Appraisal", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "environmental", label: "Environmental Report", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "survey", label: "Survey", color: "bg-teal-100 text-teal-700 border-teal-200" },
  { value: "title", label: "Title / Deed", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "insurance", label: "Insurance", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "financial", label: "Financial Statements", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "lease", label: "Lease Document", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  { value: "legal", label: "Legal", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "tax", label: "Tax", color: "bg-rose-100 text-rose-700 border-rose-200" },
  { value: "photo", label: "Photos", color: "bg-violet-100 text-violet-700 border-violet-200" },
  { value: "other", label: "Other", color: "bg-slate-100 text-slate-700 border-slate-200" },
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]["value"];

export const DOCUMENT_CATEGORY_MAP = Object.fromEntries(
  DOCUMENT_CATEGORIES.map((s) => [s.value, s])
) as Record<DocumentCategory, (typeof DOCUMENT_CATEGORIES)[number]>;
