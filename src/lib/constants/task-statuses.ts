export const TASK_STATUSES = [
  { value: "todo", label: "To Do", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "done", label: "Done", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200" },
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number]["value"];

export const TASK_STATUS_MAP = Object.fromEntries(
  TASK_STATUSES.map((s) => [s.value, s])
) as Record<TaskStatus, (typeof TASK_STATUSES)[number]>;
