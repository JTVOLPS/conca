"use client";

import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markAllRead } from "@/lib/actions/notifications";

export function MarkAllReadButton() {
  const router = useRouter();

  async function handleClick() {
    await markAllRead();
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      <CheckCheck className="mr-2 h-4 w-4" />
      Mark all as read
    </Button>
  );
}
