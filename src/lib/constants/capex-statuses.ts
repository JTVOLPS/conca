export const CAPEX_STATUSES = [
  { value: "planned", label: "Planned", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "in_progress", label: "In Progress", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "on_hold", label: "On Hold", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200" },
] as const;

export type CapexStatus = (typeof CAPEX_STATUSES)[number]["value"];

export const CAPEX_STATUS_MAP = Object.fromEntries(
  CAPEX_STATUSES.map((s) => [s.value, s])
) as Record<CapexStatus, (typeof CAPEX_STATUSES)[number]>;
