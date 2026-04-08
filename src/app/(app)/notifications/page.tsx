import Link from "next/link";
import {
  Bell,
  CheckSquare,
  ArrowRightLeft,
  FileText,
  DollarSign,
  Clock,
} from "lucide-react";
import { getNotifications } from "@/lib/actions/notifications";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { MarkAllReadButton } from "./mark-all-read-button";
import type { Notification } from "@/lib/types";

function getEntityLink(
  entityType: string | null,
  entityId: string | null
): string | null {
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
    case "task":
      return `/tasks`;
    default:
      return null;
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case "task_assigned":
      return <CheckSquare className="h-4 w-4 text-blue-500" />;
    case "deal_stage_changed":
      return <ArrowRightLeft className="h-4 w-4 text-purple-500" />;
    case "document_uploaded":
      return <FileText className="h-4 w-4 text-green-500" />;
    case "commitment_created":
    case "distribution_created":
      return <DollarSign className="h-4 w-4 text-amber-500" />;
    case "lease_expiring":
      return <Clock className="h-4 w-4 text-red-500" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}

function formatTimestamp(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

type GroupKey = "Today" | "Yesterday" | "This Week" | "Earlier";

function groupNotifications(
  notifications: Notification[]
): Record<GroupKey, Notification[]> {
  const groups: Record<GroupKey, Notification[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Earlier: [],
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  for (const n of notifications) {
    const created = new Date(n.created_at);
    if (created >= todayStart) {
      groups["Today"].push(n);
    } else if (created >= yesterdayStart) {
      groups["Yesterday"].push(n);
    } else if (created >= weekStart) {
      groups["This Week"].push(n);
    } else {
      groups["Earlier"].push(n);
    }
  }

  return groups;
}

export default async function NotificationsPage() {
  const result = await getNotifications(100);
  const notifications = (result.data ?? []) as Notification[];
  const grouped = groupNotifications(notifications);
  const hasUnread = notifications.some((n) => !n.read_at);

  const groupOrder: GroupKey[] = ["Today", "Yesterday", "This Week", "Earlier"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay up to date with your activity"
      >
        {hasUnread && <MarkAllReadButton />}
      </PageHeader>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-5 w-5" />}
          title="No notifications"
          description="You're all caught up!"
        />
      ) : (
        <div className="space-y-6">
          {groupOrder.map((group) => {
            const items = grouped[group];
            if (items.length === 0) return null;

            return (
              <div key={group}>
                <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
                  {group}
                </h2>
                <div className="space-y-1">
                  {items.map((notification) => {
                    const link = getEntityLink(
                      notification.entity_type,
                      notification.entity_id
                    );
                    const isUnread = !notification.read_at;

                    const content = (
                      <div
                        className={`flex items-start gap-3 rounded-md border px-4 py-3 transition-colors hover:bg-muted/50 ${
                          isUnread
                            ? "border-l-2 border-l-blue-500 border-t-border border-r-border border-b-border bg-blue-50/30 dark:bg-blue-950/10"
                            : "border-border"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm ${
                              isUnread ? "font-medium" : ""
                            }`}
                          >
                            {notification.title}
                          </p>
                          {notification.body && (
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {notification.body}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatTimestamp(notification.created_at)}
                          </p>
                        </div>
                        {isUnread && (
                          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                        )}
                      </div>
                    );

                    if (link) {
                      return (
                        <Link key={notification.id} href={link}>
                          {content}
                        </Link>
                      );
                    }

                    return (
                      <div key={notification.id}>{content}</div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
