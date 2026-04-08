import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import {
  taskDueReminderTemplate,
  leaseExpiryAlertTemplate,
} from "@/lib/email/templates";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  let sent = 0;

  // ---- Task due reminders (due tomorrow) ----
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const { data: dueTasks } = await admin
    .from("tasks")
    .select("id, title, due_date, entity_type, entity_id, assigned_to")
    .eq("due_date", tomorrowStr)
    .not("status", "in", '("done","cancelled")');

  if (dueTasks && dueTasks.length > 0) {
    // Get emails for assigned users via auth admin
    const userIds = [
      ...new Set(
        dueTasks
          .map((t: { assigned_to: string | null }) => t.assigned_to)
          .filter(Boolean) as string[]
      ),
    ];

    const userEmails: Record<string, string> = {};
    for (const userId of userIds) {
      const { data: userData } =
        await admin.auth.admin.getUserById(userId);
      if (userData?.user?.email) {
        userEmails[userId] = userData.user.email;
      }
    }

    // Group tasks by assignee
    const grouped: Record<
      string,
      {
        email: string;
        userName: string;
        tasks: Array<{
          title: string;
          dueDate: string;
          entityName: string | null;
        }>;
      }
    > = {};

    // Get user names from user_profiles
    const { data: profiles } = await admin
      .from("user_profiles")
      .select("id, full_name")
      .in("id", userIds);
    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, p.full_name])
    );

    for (const task of dueTasks as Array<{
      assigned_to: string | null;
      title: string;
      due_date: string;
      entity_type: string | null;
      entity_id: string | null;
    }>) {
      if (!task.assigned_to || !userEmails[task.assigned_to]) continue;
      if (!grouped[task.assigned_to]) {
        grouped[task.assigned_to] = {
          email: userEmails[task.assigned_to],
          userName: profileMap.get(task.assigned_to) ?? "there",
          tasks: [],
        };
      }
      grouped[task.assigned_to].tasks.push({
        title: task.title,
        dueDate: task.due_date,
        entityName: null,
      });
    }

    for (const group of Object.values(grouped)) {
      await sendEmail({
        to: group.email,
        subject: `You have ${group.tasks.length} task${group.tasks.length !== 1 ? "s" : ""} due tomorrow`,
        html: taskDueReminderTemplate({
          tasks: group.tasks,
          userName: group.userName,
          appUrl,
        }),
      });
      sent++;
    }
  }

  // ---- Lease expiry alerts (within 30 days) ----
  const thirtyDaysOut = new Date();
  thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30);
  const todayStr = new Date().toISOString().split("T")[0];
  const thirtyDaysStr = thirtyDaysOut.toISOString().split("T")[0];

  const { data: expiringLeases } = await admin
    .from("leases")
    .select("id, end_date, properties(name), tenants(name)")
    .gte("end_date", todayStr)
    .lte("end_date", thirtyDaysStr);

  if (expiringLeases && expiringLeases.length > 0) {
    const now = new Date();
    const leaseData = (expiringLeases as Array<Record<string, unknown>>).map(
      (lease) => {
        const endDate = new Date(lease.end_date as string);
        const daysRemaining = Math.ceil(
          (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        const prop = lease.properties as { name: string } | null;
        const tenant = lease.tenants as { name: string } | null;
        return {
          propertyName: prop?.name ?? "Unknown Property",
          tenantName: tenant?.name ?? "Unknown Tenant",
          endDate: lease.end_date as string,
          daysRemaining,
        };
      }
    );

    // Send to org admins/owners
    const { data: admins } = await admin
      .from("user_profiles")
      .select("id, role")
      .in("role", ["admin", "owner"]);

    if (admins && admins.length > 0) {
      for (const adminUser of admins) {
        const { data: userData } =
          await admin.auth.admin.getUserById(adminUser.id);
        if (userData?.user?.email) {
          await sendEmail({
            to: userData.user.email,
            subject: `${leaseData.length} lease${leaseData.length !== 1 ? "s" : ""} expiring within 30 days`,
            html: leaseExpiryAlertTemplate({
              leases: leaseData,
              appUrl,
            }),
          });
          sent++;
        }
      }
    }
  }

  return Response.json({ sent });
}
