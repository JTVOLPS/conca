"use client";

import { GripVertical, Calendar, User } from "lucide-react";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { cn, getInitials } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskCardData {
  id: string;
  title: string;
  priority: string;
  status: string;
  due_date: string | null;
  assigned_to_name: string | null;
  entity_type: string | null;
  entity_id: string | null;
}

interface TaskCardProps {
  task: TaskCardData;
  isDragOverlay?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragHandleProps?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragHandleListeners?: any;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDueDateInfo(dueDate: string | null): {
  label: string;
  className: string;
} | null {
  if (!dueDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: "Overdue", className: "text-red-600" };
  }
  if (diffDays === 0) {
    return { label: "Due today", className: "text-amber-600" };
  }
  if (diffDays <= 7) {
    const formatted = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(due);
    return { label: `Due ${formatted}`, className: "text-muted-foreground" };
  }

  const formatted = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(due);
  return { label: formatted, className: "text-muted-foreground" };
}

// ---------------------------------------------------------------------------
// TaskCard
// ---------------------------------------------------------------------------

export function TaskCard({
  task,
  isDragOverlay,
  dragHandleProps,
  dragHandleListeners,
}: TaskCardProps) {
  const dueDateInfo = getDueDateInfo(task.due_date);
  const initials = task.assigned_to_name
    ? getInitials(task.assigned_to_name)
    : null;

  return (
    <div
      className={cn(
        "group rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
        isDragOverlay && "shadow-lg ring-2 ring-primary/20"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          tabIndex={-1}
          {...(!isDragOverlay ? dragHandleProps : {})}
          {...(!isDragOverlay ? dragHandleListeners : {})}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-1">{task.title}</p>

          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <TaskPriorityBadge
              priority={task.priority}
              className="text-[10px] px-1.5 py-0"
            />
          </div>

          {dueDateInfo && (
            <div
              className={cn(
                "mt-1.5 flex items-center gap-1 text-xs",
                dueDateInfo.className
              )}
            >
              <Calendar className="h-3 w-3 shrink-0" />
              <span>{dueDateInfo.label}</span>
            </div>
          )}

          {task.assigned_to_name && initials && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                {initials}
              </span>
              <span className="truncate">{task.assigned_to_name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
