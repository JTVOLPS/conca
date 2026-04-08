"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable, SortableHeader } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { COMPANY_TYPES } from "@/lib/constants/contact-types";

interface CompanyRow {
  id: string;
  name: string;
  type: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  contact_companies?: Array<{
    contact_id: string;
    role: string | null;
    contacts: {
      id: string;
      first_name: string;
      last_name: string;
    } | null;
  }>;
}

const columns: ColumnDef<CompanyRow, unknown>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeader column={column}>Name</SortableHeader>
    ),
    cell: ({ row }) => (
      <Link
        href={`/companies/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      if (!type) return <span className="text-muted-foreground">{"\u2014"}</span>;
      const label =
        COMPANY_TYPES.find((t) => t.value === type)?.label ?? type;
      return <Badge variant="secondary">{label}</Badge>;
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.phone || "\u2014"}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.email || "\u2014"}
      </span>
    ),
  },
  {
    accessorKey: "contacts_count",
    header: "# Contacts",
    cell: ({ row }) => {
      const count = row.original.contact_companies?.length ?? 0;
      return (
        <span className="text-muted-foreground">{count}</span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <SortableHeader column={column}>Created</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDate(row.original.created_at)}
      </span>
    ),
  },
];

interface CompanyTableProps {
  companies: CompanyRow[];
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function CompanyTable({
  companies,
  totalCount,
  page,
  onPageChange,
  searchValue,
  onSearchChange,
}: CompanyTableProps) {
  return (
    <DataTable
      columns={columns}
      data={companies}
      totalCount={totalCount}
      page={page}
      onPageChange={onPageChange}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search companies..."
    />
  );
}
