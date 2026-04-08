import Link from "next/link";
import { CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { TASK_PRIORITY_MAP } from "@/lib/constants/task-priorities";

interface TaskItem {
  id: string;
  title: string;
  due_date: string | null;
  priority: string;
  entity_type: string | null;
  entity_id: string | null;
}

interface MyTasksCardProps {
  tasks: TaskItem[];
}

function getEntityLink(entityType: string | null, entityId: string | null): string | null {
  if (!entityType || !entityId) return null;
  switch (entityType) {
    case "deal":
      return `/deals/${entityId}`;
    case "property":
      return `/properties/${entityId}`;
    case "contact":
      return `/contacts/${entityId}`;
    case "company":
      return `/companies/${entityId}`;
    default:
      return null;
  }
}

function DueDateIndicator({ dueDate }: { dueDate: string | null }) {
  if (!dueDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  const diffDays = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  let className = "text-xs text-muted-foreground";
  let label = "";

  if (diffDays < 0) {
    className = "text-xs font-medium text-red-600 dark:text-red-400";
    label = `${Math.abs(diffDays)}d overdue`;
  } else if (diffDays === 0) {
    className = "text-xs font-medium text-amber-600 dark:text-amber-400";
    label = "Due today";
  } else {
    label = `Due in ${diffDays}d`;
  }

  return <span className={className}>{label}</span>;
}

export function MyTasksCard({ tasks }: MyTasksCardProps) {
  const displayTasks = tasks.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">My Tasks</CardTitle>
        <Link
          href="/tasks"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {displayTasks.length === 0 ? (
          <EmptyState
            icon={<CheckSquare className="h-5 w-5" />}
            title="No tasks"
            description="You have no open tasks assigned."
          />
        ) : (
          <div className="space-y-3">
            {displayTasks.map((task) => {
              const link =
                getEntityLink(task.entity_type, task.entity_id) ?? "/tasks";
              const priorityInfo =
                TASK_PRIORITY_MAP[
                  task.priority as keyof typeof TASK_PRIORITY_MAP
                ];

              return (
                <Link
                  key={task.id}
                  href={link}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {task.title}
                    </p>
                    <DueDateIndicator dueDate={task.due_date} />
                  </div>
                  {priorityInfo && (
                    <Badge className={`ml-2 shrink-0 ${priorityInfo.color}`}>
                      {priorityInfo.label}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
