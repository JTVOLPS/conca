"use client";

import { useState, useEffect, useCallback } from "react";
import { getTasks, deleteTask } from "@/lib/actions/tasks";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { formatDate, cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, Calendar, Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

interface EntityTasksPanelProps {
  entityType: string;
  entityId: string;
  teamMembers?: Array<{ id: string; full_name: string }>;
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EntityTasksPanel({
  entityType,
  entityId,
  teamMembers = [],
}: EntityTasksPanelProps) {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const { data } = await getTasks({
      entityType,
      entityId,
      pageSize: 100,
    });
    setTasks(data as TaskRow[]);
    setLoading(false);
  }, [entityType, entityId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refreshKey]);

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
  }

  function handleAddTask() {
    setEditingTask(null);
    setFormOpen(true);
  }

  function handleEditTask(task: TaskRow) {
    setEditingTask(task);
    setFormOpen(true);
  }

  async function handleDeleteTask() {
    if (!deleteId) return;
    await deleteTask(deleteId);
    setDeleteId(null);
    handleRefresh();
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Tasks{" "}
          <span className="text-muted-foreground font-normal">
            ({tasks.length})
          </span>
        </h3>
        <Button variant="outline" size="sm" onClick={handleAddTask}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No tasks for this {entityType}.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={handleAddTask}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Create Task
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const overdue =
              isOverdue(task.due_date) &&
              task.status !== "done" &&
              task.status !== "cancelled";

            return (
              <div
                key={task.id}
                className="flex items-start justify-between gap-3 rounded-md border p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">
                    {task.title}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    <TaskStatusBadge status={task.status} className="text-[10px] px-1.5 py-0" />
                    <TaskPriorityBadge
                      priority={task.priority}
                      className="text-[10px] px-1.5 py-0"
                    />
                    {task.due_date && (
                      <span
                        className={cn(
                          "flex items-center gap-1 text-xs",
                          overdue ? "text-red-600" : "text-muted-foreground"
                        )}
                      >
                        <Calendar className="h-3 w-3" />
                        {formatDate(task.due_date)}
                      </span>
                    )}
                    {task.assigned_to && teamMembers.find(m => m.id === task.assigned_to) && (
                      <span className="text-xs text-muted-foreground">
                        {teamMembers.find(m => m.id === task.assigned_to)!.full_name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleEditTask(task)}
                  >
                    <Pencil className="h-3 w-3" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(task.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Dialog */}
      <TaskFormDialog
        task={editingTask}
        entityType={entityType}
        entityId={entityId}
        teamMembers={teamMembers}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingTask(null);
        }}
        onSuccess={handleRefresh}
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
        onConfirm={handleDeleteTask}
      />
    </div>
  );
}
