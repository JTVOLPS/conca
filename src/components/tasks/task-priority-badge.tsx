import { Badge } from "@/components/ui/badge";
import { TASK_PRIORITY_MAP } from "@/lib/constants/task-priorities";
import type { TaskPriority } from "@/lib/constants/task-priorities";

interface TaskPriorityBadgeProps {
  priority: string;
  className?: string;
}

export function TaskPriorityBadge({ priority, className }: TaskPriorityBadgeProps) {
  const info = TASK_PRIORITY_MAP[priority as TaskPriority];

  if (!info) {
    return <Badge variant="secondary" className={className}>{priority}</Badge>;
  }

  return (
    <Badge className={`${info.color} ${className ?? ""}`}>
      {info.label}
    </Badge>
  );
}
