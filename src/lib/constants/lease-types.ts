export const LEASE_TYPES = [
  { value: "gross", label: "Gross", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "modified_gross", label: "Modified Gross", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { value: "nnn", label: "NNN (Triple Net)", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "percentage", label: "Percentage", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "ground", label: "Ground", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "month_to_month", label: "Month-to-Month", color: "bg-teal-100 text-teal-700 border-teal-200" },
  { value: "other", label: "Other", color: "bg-slate-100 text-slate-700 border-slate-200" },
] as const;

export type LeaseType = (typeof LEASE_TYPES)[number]["value"];

export const LEASE_TYPE_MAP = Object.fromEntries(
  LEASE_TYPES.map((s) => [s.value, s])
) as Record<LeaseType, (typeof LEASE_TYPES)[number]>;
