"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TASK_STATUSES, type TaskStatus } from "@/lib/constants/task-statuses";
import { updateTaskStatus } from "@/lib/actions/tasks";
import { TaskCard, type TaskCardData } from "@/components/tasks/task-card";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TaskKanbanProps {
  tasks: TaskCardData[];
  onTaskUpdated?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupTasksByStatus(tasks: TaskCardData[]) {
  const groups: Record<string, TaskCardData[]> = {};
  for (const status of TASK_STATUSES) {
    groups[status.value] = [];
  }
  for (const task of tasks) {
    if (groups[task.status]) {
      groups[task.status].push(task);
    }
  }
  return groups;
}

// ---------------------------------------------------------------------------
// SortableKanbanCard
// ---------------------------------------------------------------------------

interface SortableKanbanCardProps {
  task: TaskCardData;
}

function SortableKanbanCard({ task }: SortableKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-50")}
      {...attributes}
    >
      <TaskCard
        task={task}
        dragHandleProps={attributes as unknown as Record<string, unknown>}
        dragHandleListeners={listeners as unknown as Record<string, unknown>}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// KanbanColumn
// ---------------------------------------------------------------------------

interface KanbanColumnProps {
  status: (typeof TASK_STATUSES)[number];
  tasks: TaskCardData[];
}

function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  const taskIds = tasks.map((t) => t.id);

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/50 border">
      {/* Column header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{status.label}</h3>
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2 overflow-y-auto p-2 min-h-[100px]">
          {tasks.length === 0 && (
            <div className="flex h-20 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
              No tasks
            </div>
          )}
          {tasks.map((task) => (
            <SortableKanbanCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TaskKanban (main)
// ---------------------------------------------------------------------------

export function TaskKanban({ tasks: initialTasks, onTaskUpdated }: TaskKanbanProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);

  const grouped = useMemo(() => groupTasksByStatus(tasks), [tasks]);

  const activeTask = useMemo(
    () => (activeId ? tasks.find((t) => t.id === activeId) ?? null : null),
    [activeId, tasks]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null);

      const { active, over } = event;
      if (!over) return;

      const draggedTaskId = String(active.id);
      const draggedTask = tasks.find((t) => t.id === draggedTaskId);
      if (!draggedTask) return;

      // Determine target status and position
      let targetStatus: string;
      let targetPosition: number;

      const overTask = tasks.find((t) => t.id === String(over.id));
      if (overTask) {
        targetStatus = overTask.status;
        const statusTasks = grouped[targetStatus] ?? [];
        const overIndex = statusTasks.findIndex((t) => t.id === overTask.id);
        targetPosition = overIndex >= 0 ? overIndex : statusTasks.length;
      } else {
        // Dropped over a status identifier
        const statusValue = String(over.id);
        const validStatus = TASK_STATUSES.find((s) => s.value === statusValue);
        targetStatus = validStatus ? statusValue : draggedTask.status;
        targetPosition = (grouped[targetStatus] ?? []).length;
      }

      // No change needed
      if (draggedTask.status === targetStatus) {
        return;
      }

      // Optimistic update
      const previousTasks = [...tasks];
      setTasks((prev) =>
        prev.map((t) =>
          t.id === draggedTaskId
            ? { ...t, status: targetStatus }
            : t
        )
      );

      // Server update
      const { error } = await updateTaskStatus(
        draggedTaskId,
        targetStatus as TaskStatus,
        targetPosition
      );

      if (error) {
        // Revert on failure
        setTasks(previousTasks);
        console.error("Failed to update task status:", error);
      } else {
        onTaskUpdated?.();
      }
    },
    [tasks, grouped, onTaskUpdated]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {TASK_STATUSES.map((status) => (
          <KanbanColumn
            key={status.value}
            status={status}
            tasks={grouped[status.value] ?? []}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="w-72">
            <TaskCard task={activeTask} isDragOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
