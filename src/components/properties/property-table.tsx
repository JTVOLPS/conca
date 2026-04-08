"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable, SortableHeader } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { ASSET_CLASS_MAP } from "@/lib/constants/asset-classes";
import { formatNumber, formatDate } from "@/lib/utils";

interface PropertyRow {
  id: string;
  name: string;
  asset_class: string;
  status: string;
  city: string | null;
  state: string | null;
  total_sf: number | null;
  num_units: number | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  under_contract: "bg-amber-100 text-amber-700 border-amber-200",
  closed: "bg-blue-100 text-blue-700 border-blue-200",
  disposed: "bg-slate-100 text-slate-700 border-slate-200",
  watch_list: "bg-purple-100 text-purple-700 border-purple-200",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  under_contract: "Under Contract",
  closed: "Closed",
  disposed: "Disposed",
  watch_list: "Watch List",
};

const columns: ColumnDef<PropertyRow, unknown>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    cell: ({ row }) => (
      <Link
        href={`/properties/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.name}
      </Link>
    ),
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
    id: "location",
    header: "City / State",
    cell: ({ row }) => {
      const { city, state } = row.original;
      if (!city && !state) return <span className="text-muted-foreground">--</span>;
      return [city, state].filter(Boolean).join(", ");
    },
  },
  {
    accessorKey: "total_sf",
    header: ({ column }) => <SortableHeader column={column}>Total SF</SortableHeader>,
    cell: ({ row }) => formatNumber(row.original.total_sf),
  },
  {
    accessorKey: "num_units",
    header: ({ column }) => <SortableHeader column={column}>Units</SortableHeader>,
    cell: ({ row }) => formatNumber(row.original.num_units),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge className={STATUS_COLORS[status] ?? ""}>
          {STATUS_LABELS[status] ?? status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <SortableHeader column={column}>Created</SortableHeader>,
    cell: ({ row }) => formatDate(row.original.created_at),
  },
];

interface PropertyTableProps {
  data: PropertyRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange?: (page: number) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function PropertyTable({
  data,
  totalCount,
  page,
  pageSize,
  onPageChange,
  searchValue,
  onSearchChange,
}: PropertyTableProps) {
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
      searchPlaceholder="Search properties..."
    />
  );
}
