import { Badge } from "@/components/ui/badge";
import { TASK_STATUS_MAP } from "@/lib/constants/task-statuses";
import type { TaskStatus } from "@/lib/constants/task-statuses";

interface TaskStatusBadgeProps {
  status: string;
  className?: string;
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const info = TASK_STATUS_MAP[status as TaskStatus];

  if (!info) {
    return <Badge variant="secondary" className={className}>{status}</Badge>;
  }

  return (
    <Badge className={`${info.color} ${className ?? ""}`}>
      {info.label}
    </Badge>
  );
}
