"use client";

import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserProfile } from "@/lib/types";

interface UserMenuProps {
  user: UserProfile;
  email?: string;
}

export function UserMenu({ user, email }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-8 w-8 cursor-pointer">
          {user.avatar_url && (
            <AvatarImage src={user.avatar_url} alt={user.full_name} />
          )}
          <AvatarFallback className="text-xs">
            {getInitials(user.full_name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.full_name}
            </p>
            {email && (
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {}}>
          <Link
            href="/settings/profile"
            className="flex w-full items-center gap-2"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {}}>
          <Link
            href="/settings"
            className="flex w-full items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            signOut();
          }}
          className="text-destructive focus:text-destructive"
        >
          <div className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign out
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
