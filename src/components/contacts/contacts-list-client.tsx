"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONTACT_TYPES } from "@/lib/constants/contact-types";
import { ContactTable } from "@/components/contacts/contact-table";

interface ContactsListClientProps {
  contacts: Array<Record<string, unknown>>;
  totalCount: number;
  initialSearch: string;
  initialPage: number;
  initialType: string;
}

export function ContactsListClient({
  contacts,
  totalCount,
  initialSearch,
  initialPage,
  initialType,
}: ContactsListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);

  const buildUrl = useCallback(
    (overrides: { q?: string; page?: number; type?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (overrides.q !== undefined) {
        if (overrides.q) params.set("q", overrides.q);
        else params.delete("q");
      }
      if (overrides.page !== undefined) {
        if (overrides.page > 1) params.set("page", String(overrides.page));
        else params.delete("page");
      }
      if (overrides.type !== undefined) {
        if (overrides.type) params.set("type", overrides.type);
        else params.delete("type");
      }
      const qs = params.toString();
      return `/contacts${qs ? `?${qs}` : ""}`;
    },
    [searchParams]
  );

  function handleSearchChange(value: string) {
    setSearch(value);
    router.push(buildUrl({ q: value, page: 1 }));
  }

  function handlePageChange(page: number) {
    router.push(buildUrl({ page }));
  }

  function handleTypeChange(value: string) {
    router.push(buildUrl({ type: value === "all" ? "" : value, page: 1 }));
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Contacts" description="Manage your contacts and relationships">
        <Link href="/contacts/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Contact
          </Button>
        </Link>
      </PageHeader>

      <div className="flex items-center gap-3">
        <div className="w-48">
          <Select
            value={initialType || "all"}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {CONTACT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {contacts.length === 0 && !search ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="No contacts yet"
          description="Add your first contact to start building your network."
          action={
            <Link href="/contacts/new">
              <Button>
                <Plus className="h-4 w-4" />
                New Contact
              </Button>
            </Link>
          }
        />
      ) : (
        <ContactTable
          contacts={contacts as unknown as Parameters<typeof ContactTable>[0]["contacts"]}
          totalCount={totalCount}
          page={initialPage}
          onPageChange={handlePageChange}
          searchValue={search}
          onSearchChange={handleSearchChange}
        />
      )}
    </div>
  );
}
