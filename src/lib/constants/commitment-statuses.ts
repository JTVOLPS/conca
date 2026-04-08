export const COMMITMENT_STATUSES = [
  { value: "committed", label: "Committed", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "partially_called", label: "Partially Called", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "fully_called", label: "Fully Called", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "returned", label: "Returned", color: "bg-slate-100 text-slate-700 border-slate-200" },
] as const;

export type CommitmentStatus = (typeof COMMITMENT_STATUSES)[number]["value"];

export const COMMITMENT_STATUS_MAP = Object.fromEntries(
  COMMITMENT_STATUSES.map((s) => [s.value, s])
) as Record<CommitmentStatus, (typeof COMMITMENT_STATUSES)[number]>;
