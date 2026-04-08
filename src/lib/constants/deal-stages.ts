export const DEAL_STAGES = [
  { value: "sourcing", label: "Sourcing", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: "loi", label: "LOI", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "under_contract", label: "Under Contract", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "due_diligence", label: "Due Diligence", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "closed", label: "Closed", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "dead", label: "Dead", color: "bg-red-100 text-red-700 border-red-200" },
] as const;

export type DealStage = (typeof DEAL_STAGES)[number]["value"];

export const DEAL_STAGE_MAP = Object.fromEntries(
  DEAL_STAGES.map((s) => [s.value, s])
) as Record<DealStage, (typeof DEAL_STAGES)[number]>;
