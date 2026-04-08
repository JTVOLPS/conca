export const TASK_PRIORITIES = [
  { value: "low", label: "Low", color: "bg-slate-100 text-slate-600 border-slate-200" },
  { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "high", label: "High", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700 border-red-200" },
] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number]["value"];

export const TASK_PRIORITY_MAP = Object.fromEntries(
  TASK_PRIORITIES.map((p) => [p.value, p])
) as Record<TaskPriority, (typeof TASK_PRIORITIES)[number]>;
