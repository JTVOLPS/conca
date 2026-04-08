"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Building2, Plus } from "lucide-react";
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
import { COMPANY_TYPES } from "@/lib/constants/contact-types";
import { CompanyTable } from "@/components/companies/company-table";

interface CompaniesListClientProps {
  companies: Array<Record<string, unknown>>;
  totalCount: number;
  initialSearch: string;
  initialPage: number;
  initialType: string;
}

export function CompaniesListClient({
  companies,
  totalCount,
  initialSearch,
  initialPage,
  initialType,
}: CompaniesListClientProps) {
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
      return `/companies${qs ? `?${qs}` : ""}`;
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
      <PageHeader title="Companies" description="Manage your company relationships">
        <Link href="/companies/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Company
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
              {COMPANY_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {companies.length === 0 && !search ? (
        <EmptyState
          icon={<Building2 className="h-5 w-5" />}
          title="No companies yet"
          description="Add your first company to start tracking organizations."
          action={
            <Link href="/companies/new">
              <Button>
                <Plus className="h-4 w-4" />
                New Company
              </Button>
            </Link>
          }
        />
      ) : (
        <CompanyTable
          companies={companies as unknown as Parameters<typeof CompanyTable>[0]["companies"]}
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
