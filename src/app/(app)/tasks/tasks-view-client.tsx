"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Table, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskKanban } from "@/components/tasks/task-kanban";
import { TaskList } from "@/components/tasks/task-list";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteTask } from "@/lib/actions/tasks";
import { TASK_STATUSES } from "@/lib/constants/task-statuses";
import { TASK_PRIORITIES } from "@/lib/constants/task-priorities";
import { cn } from "@/lib/utils";
import type { TaskCardData } from "@/components/tasks/task-card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ViewMode = "kanban" | "list";

interface TaskRow {
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
}

interface TasksViewClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tasks: any[];
  teamMembers: Array<{ id: string; full_name: string }>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TasksViewClient({ tasks, teamMembers }: TasksViewClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [view, setView] = useState<ViewMode>("kanban");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Read filters from URL search params
  const statusFilter = searchParams.get("status") ?? "";
  const priorityFilter = searchParams.get("priority") ?? "";
  const assignedToFilter = searchParams.get("assigned_to") ?? "";
  const searchFilter = searchParams.get("q") ?? "";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/tasks?${params.toString()}`);
    },
    [searchParams, router]
  );

  // Filter tasks client-side for instant feedback
  const filteredTasks = useMemo(() => {
    let result = tasks as TaskRow[];

    if (statusFilter) {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (priorityFilter) {
      result = result.filter((t) => t.priority === priorityFilter);
    }
    if (assignedToFilter) {
      result = result.filter((t) => t.assigned_to === assignedToFilter);
    }
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }

    return result;
  }, [tasks, statusFilter, priorityFilter, assignedToFilter, searchFilter]);

  // Map to kanban card data
  const teamMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of teamMembers) map.set(m.id, m.full_name);
    return map;
  }, [teamMembers]);

  const kanbanTasks: TaskCardData[] = useMemo(
    () =>
      filteredTasks.map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        status: t.status,
        due_date: t.due_date ?? null,
        assigned_to_name: t.assigned_to ? teamMap.get(t.assigned_to) ?? null : null,
        entity_type: t.entity_type ?? null,
        entity_id: t.entity_id ?? null,
      })),
    [filteredTasks, teamMap]
  );

  function handleEdit(task: TaskRow) {
    setEditingTask(task);
    setFormOpen(true);
  }

  function handleNewTask() {
    setEditingTask(null);
    setFormOpen(true);
  }

  function handleSuccess() {
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteId) return;
    await deleteTask(deleteId);
    setDeleteId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 px-2.5 text-xs",
                view === "kanban" && "bg-background shadow-sm"
              )}
              onClick={() => setView("kanban")}
            >
              <LayoutGrid className="h-3.5 w-3.5 mr-1" />
              Board
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 px-2.5 text-xs",
                view === "list" && "bg-background shadow-sm"
              )}
              onClick={() => setView("list")}
            >
              <Table className="h-3.5 w-3.5 mr-1" />
              List
            </Button>
          </div>

          {/* Filters */}
          <Select
            value={statusFilter}
            onValueChange={(val) =>
              updateFilter("status", val === "__all__" ? "" : val)
            }
          >
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All statuses</SelectItem>
              {TASK_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={priorityFilter}
            onValueChange={(val) =>
              updateFilter("priority", val === "__all__" ? "" : val)
            }
          >
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All priorities</SelectItem>
              {TASK_PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={assignedToFilter}
            onValueChange={(val) =>
              updateFilter("assigned_to", val === "__all__" ? "" : val)
            }
          >
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="All members" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All members</SelectItem>
              {teamMembers.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchFilter}
              onChange={(e) => updateFilter("q", e.target.value)}
              className="h-8 w-[180px] pl-8 text-xs"
            />
          </div>
        </div>

        <Button size="sm" onClick={handleNewTask}>
          <Plus className="h-4 w-4 mr-1" />
          New Task
        </Button>
      </div>

      {/* Content */}
      {view === "kanban" ? (
        <TaskKanban tasks={kanbanTasks} onTaskUpdated={handleSuccess} />
      ) : (
        <TaskList
          tasks={filteredTasks}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      {/* Form Dialog */}
      <TaskFormDialog
        task={editingTask}
        teamMembers={teamMembers}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingTask(null);
        }}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
