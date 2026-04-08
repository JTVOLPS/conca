"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable, SortableHeader } from "@/components/shared/data-table";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { formatDate, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TaskData {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  due_date?: string | null;
  assigned_to?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  created_at: string;
  user_profiles?: { full_name: string } | null;
}

interface TaskListProps {
  tasks: TaskData[];
  onEdit?: (task: TaskData) => void;
  onDelete?: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isOverdue(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  return due < today;
}

function entityLink(entityType: string | null | undefined, entityId: string | null | undefined) {
  if (!entityType || !entityId) return null;
  const pathMap: Record<string, string> = {
    deal: "/deals",
    property: "/properties",
    contact: "/contacts",
    company: "/companies",
  };
  const basePath = pathMap[entityType];
  if (!basePath) return null;
  return `${basePath}/${entityId}`;
}

// ---------------------------------------------------------------------------
// Columns factory (closures for callbacks)
// ---------------------------------------------------------------------------

function getColumns(
  onEdit?: (task: TaskData) => void,
  onDelete?: (id: string) => void
): ColumnDef<TaskData, unknown>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <SortableHeader column={column}>Title</SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <TaskPriorityBadge priority={row.original.priority} />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <TaskStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "due_date",
      header: ({ column }) => (
        <SortableHeader column={column}>Due Date</SortableHeader>
      ),
      cell: ({ row }) => {
        const dueDate = row.original.due_date;
        const overdue = isOverdue(dueDate);
        return (
          <span className={cn(overdue && "text-red-600 font-medium")}>
            {formatDate(dueDate)}
          </span>
        );
      },
    },
    {
      id: "assigned_to",
      header: "Assigned To",
      cell: ({ row }) => {
        const name = row.original.user_profiles?.full_name;
        if (!name) return <span className="text-muted-foreground">--</span>;
        return <span className="text-sm">{name}</span>;
      },
    },
    {
      id: "entity",
      header: "Entity",
      cell: ({ row }) => {
        const { entity_type, entity_id } = row.original;
        if (!entity_type || !entity_id) {
          return <span className="text-muted-foreground">--</span>;
        }
        const href = entityLink(entity_type, entity_id);
        const label = entity_type.charAt(0).toUpperCase() + entity_type.slice(1);
        if (!href) return <span className="text-sm">{label}</span>;
        return (
          <Link href={href} className="text-sm text-primary hover:underline">
            {label}
          </Link>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <SortableHeader column={column}>Created</SortableHeader>
      ),
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onEdit(row.original)}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="sr-only">Edit</span>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={() => onDelete(row.original.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="sr-only">Delete</span>
            </Button>
          )}
        </div>
      ),
    },
  ];
}

// ---------------------------------------------------------------------------
// TaskList
// ---------------------------------------------------------------------------

export function TaskList({ tasks, onEdit, onDelete }: TaskListProps) {
  const columns = getColumns(onEdit, onDelete);

  return (
    <DataTable
      columns={columns}
      data={tasks}
      totalCount={tasks.length}
      searchPlaceholder="Search tasks..."
    />
  );
}
