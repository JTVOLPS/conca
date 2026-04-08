"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { taskSchema, type TaskFormData } from "@/lib/schemas/task";
import { sendEmail } from "@/lib/email/send";
import { taskAssignedTemplate } from "@/lib/email/templates";
import { notifyTaskAssigned } from "@/lib/actions/notification-triggers";

export async function createTask(formData: TaskFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = taskSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const orgId = user.app_metadata?.org_id;
  if (!orgId) return { data: null, error: "No organization found" };

  const assignedTo = parsed.data.assigned_to || null;
  const isDone = parsed.data.status === "done";

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      due_date: parsed.data.due_date || null,
      entity_type: parsed.data.entity_type || null,
      entity_id: parsed.data.entity_id || null,
      assigned_to: assignedTo,
      org_id: orgId,
      created_by: user.id,
      completed_at: isDone ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (!error) {
    revalidatePath("/tasks");
    if (parsed.data.entity_type && parsed.data.entity_id) {
      const entityPath =
        parsed.data.entity_type === "deal"
          ? `/deals/${parsed.data.entity_id}`
          : parsed.data.entity_type === "property"
            ? `/properties/${parsed.data.entity_id}`
            : parsed.data.entity_type === "contact"
              ? `/contacts/${parsed.data.entity_id}`
              : `/companies/${parsed.data.entity_id}`;
      revalidatePath(entityPath);
    }

    // Send email notification if assigned to a different user
    if (assignedTo && assignedTo !== user.id) {
      try {
        const { data: assigneeProfile } = await supabase
          .from("user_profiles")
          .select("full_name")
          .eq("id", assignedTo)
          .single();

        const adminClient = createAdminClient();
        const { data: assigneeAuth } = await adminClient.auth.admin.getUserById(assignedTo);
        const assigneeEmail = assigneeAuth?.user?.email;

        if (assigneeEmail) {
          const appUrl =
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
          sendEmail({
            to: assigneeEmail,
            subject: `Task assigned: ${parsed.data.title}`,
            html: taskAssignedTemplate({
              taskTitle: parsed.data.title,
              assigneeName: assigneeProfile?.full_name ?? "there",
              dueDate: parsed.data.due_date || null,
              entityName: null,
              appUrl,
            }),
          });
        }
      } catch {
        // Email sending should not block task creation
      }

      // In-app notification for task assignment
      try {
        const { data: assignerProfile } = await supabase
          .from("user_profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (data) {
          notifyTaskAssigned(
            orgId,
            data.id,
            assignedTo,
            assignerProfile?.full_name ?? "Someone",
            parsed.data.title
          );
        }
      } catch {
        // Notification should not block task creation
      }
    }
  }

  return { data, error: error?.message ?? null };
}

export async function getTasks(options?: {
  entityType?: string;
  entityId?: string;
  assignedTo?: string;
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], count: 0, error: "Not authenticated" };

  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("tasks")
    .select("*", { count: "exact" });

  if (options?.entityType) {
    query = query.eq("entity_type", options.entityType as any);
  }

  if (options?.entityId) {
    query = query.eq("entity_id", options.entityId);
  }

  if (options?.assignedTo) {
    query = query.eq("assigned_to", options.assignedTo);
  }

  if (options?.status) {
    query = query.eq("status", options.status as any);
  }

  if (options?.priority) {
    query = query.eq("priority", options.priority as any);
  }

  if (options?.search) {
    query = query.ilike("title", `%${options.search}%`);
  }

  const sortBy = options?.sortBy ?? "created_at";
  const sortOrder = options?.sortOrder ?? "desc";
  query = query.order(sortBy, { ascending: sortOrder === "asc" });
  query = query.range(from, to);

  const { data, count, error } = await query;
  return { data: data ?? [], count: count ?? 0, error: error?.message ?? null };
}

export async function getTask(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error: error?.message ?? null };
}

export async function updateTask(id: string, formData: TaskFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = taskSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  // Check if status changed for completed_at logic
  const { data: currentTask } = await supabase
    .from("tasks")
    .select("status")
    .eq("id", id)
    .single();

  const assignedTo = parsed.data.assigned_to || null;
  const wasNotDone = currentTask?.status !== "done";
  const isNowDone = parsed.data.status === "done";
  const wasDone = currentTask?.status === "done";
  const isNowNotDone = parsed.data.status !== "done";

  let completedAt: string | null | undefined;
  if (wasNotDone && isNowDone) {
    completedAt = new Date().toISOString();
  } else if (wasDone && isNowNotDone) {
    completedAt = null;
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      due_date: parsed.data.due_date || null,
      entity_type: parsed.data.entity_type || null,
      entity_id: parsed.data.entity_id || null,
      assigned_to: assignedTo,
      ...(completedAt !== undefined ? { completed_at: completedAt } : {}),
    })
    .eq("id", id)
    .select()
    .single();

  if (!error) {
    revalidatePath("/tasks");
    revalidatePath(`/tasks/${id}`);
  }
  return { data, error: error?.message ?? null };
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: string,
  newPosition: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: currentTask } = await supabase
    .from("tasks")
    .select("status")
    .eq("id", taskId)
    .single();

  if (!currentTask) return { error: "Task not found" };

  const wasNotDone = currentTask.status !== "done";
  const isNowDone = newStatus === "done";
  const wasDone = currentTask.status === "done";
  const isNowNotDone = newStatus !== "done";

  let completedAt: string | null | undefined;
  if (wasNotDone && isNowDone) {
    completedAt = new Date().toISOString();
  } else if (wasDone && isNowNotDone) {
    completedAt = null;
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      status: newStatus as any,
      position: newPosition,
      ...(completedAt !== undefined ? { completed_at: completedAt } : {}),
    })
    .eq("id", taskId);

  if (!error) revalidatePath("/tasks");
  return { error: error?.message ?? null };
}

export async function deleteTask(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (!error) revalidatePath("/tasks");
  return { error: error?.message ?? null };
}

export async function getMyTasks(limit?: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("assigned_to", user.id)
    .not("status", "in", '("done","cancelled")')
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(limit ?? 10);

  return { data: data ?? [], error: error?.message ?? null };
}

export async function getOverdueTasks() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .lt("due_date", today)
    .not("status", "in", '("done","cancelled")')
    .order("due_date", { ascending: true });

  return { data: data ?? [], error: error?.message ?? null };
}
