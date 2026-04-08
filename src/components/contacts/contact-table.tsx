"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable, SortableHeader } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CONTACT_TYPES } from "@/lib/constants/contact-types";

interface ContactRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  type: string | null;
  tags: string[] | null;
  created_at: string;
  contact_companies?: Array<{
    company_id: string;
    role: string | null;
    is_primary: boolean;
    companies: { id: string; name: string } | null;
  }>;
}

const columns: ColumnDef<ContactRow, unknown>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeader column={column}>Name</SortableHeader>
    ),
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    cell: ({ row }) => (
      <Link
        href={`/contacts/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.first_name} {row.original.last_name}
      </Link>
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
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.phone || "\u2014"}
      </span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      if (!type) return <span className="text-muted-foreground">{"\u2014"}</span>;
      const label =
        CONTACT_TYPES.find((t) => t.value === type)?.label ?? type;
      return <Badge variant="secondary">{label}</Badge>;
    },
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => {
      const companies = row.original.contact_companies;
      if (!companies?.length) {
        return <span className="text-muted-foreground">{"\u2014"}</span>;
      }
      const primary =
        companies.find((c) => c.is_primary) ?? companies[0];
      if (!primary?.companies) {
        return <span className="text-muted-foreground">{"\u2014"}</span>;
      }
      return (
        <Link
          href={`/companies/${primary.companies.id}`}
          className="text-primary hover:underline"
        >
          {primary.companies.name}
        </Link>
      );
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.tags;
      if (!tags?.length) return null;
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 3}
            </Badge>
          )}
        </div>
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

interface ContactTableProps {
  contacts: ContactRow[];
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function ContactTable({
  contacts,
  totalCount,
  page,
  onPageChange,
  searchValue,
  onSearchChange,
}: ContactTableProps) {
  return (
    <DataTable
      columns={columns}
      data={contacts}
      totalCount={totalCount}
      page={page}
      onPageChange={onPageChange}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search contacts..."
    />
  );
}
