"use client";

import * as React from "react";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";
import { MobileSidebar } from "@/components/layout/sidebar";
import type { UserProfile } from "@/lib/types";

interface TopbarProps {
  user: UserProfile;
  email?: string;
}

export function Topbar({ user, email }: TopbarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
        {/* Left: mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Center: Search */}
        <div className="flex-1 flex justify-center md:justify-start">
          <Button
            variant="outline"
            className="relative h-9 w-full max-w-sm justify-start text-sm text-muted-foreground"
            onClick={() => {
              // Global search will be implemented later
            }}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search...</span>
            <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
              <span className="text-xs">&#8984;</span>K
            </kbd>
          </Button>
        </div>

        {/* Right: User menu */}
        <div className="flex items-center gap-2">
          <UserMenu user={user} email={email} />
        </div>
      </header>

      {/* Mobile sidebar sheet */}
      <MobileSidebar
        user={user}
        open={mobileOpen}
        onOpenChange={setMobileOpen}
      />
    </>
  );
}
