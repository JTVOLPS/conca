import { CheckSquare } from "lucide-react";
import { getTasks } from "@/lib/actions/tasks";
import { getTeamMembers } from "@/lib/actions/invitations";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TasksViewClient } from "./tasks-view-client";
import { TasksExportWrapper } from "./tasks-export-wrapper";

export default async function TasksPage() {
  const [tasksResult, teamResult] = await Promise.all([
    getTasks({ pageSize: 200 }),
    getTeamMembers(),
  ]);

  if (tasksResult.error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Tasks" />
        <p className="text-sm text-destructive">
          Failed to load tasks: {tasksResult.error}
        </p>
      </div>
    );
  }

  const tasks = tasksResult.data;
  const teamMembers = (teamResult.data ?? []).map((m: { id: string; full_name: string }) => ({
    id: m.id,
    full_name: m.full_name,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" description="Manage and track your team's tasks">
        <TasksExportWrapper tasks={tasks as Record<string, unknown>[]} />
      </PageHeader>

      {tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="h-5 w-5" />}
          title="No tasks yet"
          description="Create your first task to get started."
        />
      ) : (
        <TasksViewClient tasks={tasks} teamMembers={teamMembers} />
      )}
    </div>
  );
}
