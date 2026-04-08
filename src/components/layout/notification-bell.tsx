"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckSquare,
  ArrowRightLeft,
  FileText,
  DollarSign,
  Clock,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
} from "@/lib/actions/notifications";
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

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
}

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    const [notifResult, countResult] = await Promise.all([
      getNotifications(10),
      getUnreadCount(),
    ]);
    setNotifications(notifResult.data as Notification[]);
    setUnreadCount(countResult.count);
  }, []);

  // Initial load
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Refresh when popover opens
  React.useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

  async function handleMarkAllRead() {
    await markAllRead();
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read_at: n.read_at ?? new Date().toISOString(),
      }))
    );
    setUnreadCount(0);
  }

  async function handleClickNotification(notification: Notification) {
    if (!notification.read_at) {
      await markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    const link = getEntityLink(
      notification.entity_type,
      notification.entity_id
    );
    setOpen(false);
    if (link) {
      router.push(link);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="relative inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* Notification list */}
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleClickNotification(notification)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${
                    !notification.read_at ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm leading-tight ${
                        !notification.read_at ? "font-medium" : ""
                      }`}
                    >
                      {notification.title}
                    </p>
                    {notification.body && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {notification.body}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {relativeTime(notification.created_at)}
                    </p>
                  </div>
                  {!notification.read_at && (
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-border px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setOpen(false);
                router.push("/notifications");
              }}
            >
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
