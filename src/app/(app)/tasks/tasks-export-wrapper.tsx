"use client";

import { ExportButton } from "@/components/shared/export-button";

interface TasksExportWrapperProps {
  tasks: Record<string, unknown>[];
}

const TASK_COLUMNS = [
  { key: "title", header: "Title" },
  { key: "status", header: "Status" },
  { key: "priority", header: "Priority" },
  { key: "due_date", header: "Due Date" },
  { key: "entity_type", header: "Entity Type" },
  { key: "created_at", header: "Created At" },
];

export function TasksExportWrapper({ tasks }: TasksExportWrapperProps) {
  return (
    <ExportButton
      data={tasks}
      filename="tasks-export"
      columns={TASK_COLUMNS}
    />
  );
}
