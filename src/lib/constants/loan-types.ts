export const LOAN_TYPES = [
  { value: "permanent", label: "Permanent", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "bridge", label: "Bridge", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "construction", label: "Construction", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "mezzanine", label: "Mezzanine", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "line_of_credit", label: "Line of Credit", color: "bg-teal-100 text-teal-700 border-teal-200" },
  { value: "other", label: "Other", color: "bg-slate-100 text-slate-700 border-slate-200" },
] as const;

export type LoanType = (typeof LOAN_TYPES)[number]["value"];

export const LOAN_TYPE_MAP = Object.fromEntries(
  LOAN_TYPES.map((s) => [s.value, s])
) as Record<LoanType, (typeof LOAN_TYPES)[number]>;

export const RATE_TYPES = [
  { value: "fixed", label: "Fixed", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "floating", label: "Floating", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  { value: "hybrid", label: "Hybrid", color: "bg-violet-100 text-violet-700 border-violet-200" },
] as const;

export type RateType = (typeof RATE_TYPES)[number]["value"];

export const RATE_TYPE_MAP = Object.fromEntries(
  RATE_TYPES.map((s) => [s.value, s])
) as Record<RateType, (typeof RATE_TYPES)[number]>;

export const RECOURSE_TYPES = [
  { value: "full", label: "Full Recourse", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "partial", label: "Partial Recourse", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "non_recourse", label: "Non-Recourse", color: "bg-green-100 text-green-700 border-green-200" },
] as const;

export type RecourseType = (typeof RECOURSE_TYPES)[number]["value"];

export const RECOURSE_TYPE_MAP = Object.fromEntries(
  RECOURSE_TYPES.map((s) => [s.value, s])
) as Record<RecourseType, (typeof RECOURSE_TYPES)[number]>;
