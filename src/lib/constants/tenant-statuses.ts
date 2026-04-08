export const TENANT_STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "expired", label: "Expired", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "month_to_month", label: "Month-to-Month", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "vacating", label: "Vacating", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "vacated", label: "Vacated", color: "bg-slate-100 text-slate-700 border-slate-200" },
] as const;

export type TenantStatus = (typeof TENANT_STATUSES)[number]["value"];

export const TENANT_STATUS_MAP = Object.fromEntries(
  TENANT_STATUSES.map((s) => [s.value, s])
) as Record<TenantStatus, (typeof TENANT_STATUSES)[number]>;
