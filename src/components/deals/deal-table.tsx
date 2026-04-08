"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable, SortableHeader } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { DealStageBadge } from "@/components/deals/deal-stage-badge";
import { ASSET_CLASS_MAP } from "@/lib/constants/asset-classes";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DealRow {
  id: string;
  name: string;
  stage: string;
  asset_class: string;
  created_at: string;
  properties?: { id: string; name: string; city: string | null; state: string | null } | null;
  deal_economics?: Array<{ purchase_price: number | null }> | null;
}

const columns: ColumnDef<DealRow, unknown>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    cell: ({ row }) => (
      <Link
        href={`/deals/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "stage",
    header: "Stage",
    cell: ({ row }) => <DealStageBadge stage={row.original.stage} />,
  },
  {
    accessorKey: "asset_class",
    header: "Asset Class",
    cell: ({ row }) => {
      const ac = ASSET_CLASS_MAP[row.original.asset_class as keyof typeof ASSET_CLASS_MAP];
      return (
        <Badge variant="secondary">
          {ac?.label ?? row.original.asset_class}
        </Badge>
      );
    },
  },
  {
    id: "property",
    header: "Property",
    cell: ({ row }) => {
      const prop = row.original.properties;
      if (!prop) return <span className="text-muted-foreground">--</span>;
      return (
        <Link
          href={`/properties/${prop.id}`}
          className="text-sm hover:underline"
        >
          {prop.name}
        </Link>
      );
    },
  },
  {
    id: "purchase_price",
    header: ({ column }) => (
      <SortableHeader column={column}>Purchase Price</SortableHeader>
    ),
    accessorFn: (row) => {
      const econ = row.deal_economics;
      if (Array.isArray(econ) && econ.length > 0) return econ[0].purchase_price;
      return null;
    },
    cell: ({ row }) => {
      const econ = row.original.deal_economics;
      const price = Array.isArray(econ) && econ.length > 0 ? econ[0].purchase_price : null;
      return formatCurrency(price);
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <SortableHeader column={column}>Created</SortableHeader>,
    cell: ({ row }) => formatDate(row.original.created_at),
  },
];

interface DealTableProps {
  data: DealRow[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function DealTable({
  data,
  totalCount,
  page,
  pageSize,
  onPageChange,
  searchValue,
  onSearchChange,
}: DealTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      onPageChange={onPageChange}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search deals..."
    />
  );
}
