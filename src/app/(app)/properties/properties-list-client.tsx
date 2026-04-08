"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { PropertyTable } from "@/components/properties/property-table";

interface PropertiesListClientProps {
  properties: Array<{
    id: string;
    name: string;
    asset_class: string;
    status: string;
    city: string | null;
    state: string | null;
    total_sf: number | null;
    num_units: number | null;
    created_at: string;
  }>;
  totalCount: number;
  page: number;
  pageSize: number;
  initialSearch: string;
}

export function PropertiesListClient({
  properties,
  totalCount,
  page,
  pageSize,
  initialSearch,
}: PropertiesListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      startTransition(() => {
        router.push(`/properties?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition]
  );

  return (
    <PropertyTable
      data={properties}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      searchValue={initialSearch}
      onSearchChange={(value) =>
        updateParams({ search: value || undefined, page: undefined })
      }
      onPageChange={(p) => updateParams({ page: String(p) })}
    />
  );
}
