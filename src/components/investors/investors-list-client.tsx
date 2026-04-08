"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Users, Eye, Pencil, Trash2 } from "lucide-react";
import { deleteInvestor } from "@/lib/actions/investors";
import { INVESTOR_TYPE_MAP, type InvestorType } from "@/lib/constants/investor-types";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable, SortableHeader } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InvestorRow {
  id: string;
  name: string;
  type: string;
  accredited: boolean;
  contact_id: string | null;
  contacts: { first_name: string; last_name: string } | null;
  companies: { name: string } | null;
  investor_commitments?: Array<{
    committed_amount: number;
    deal_id: string;
  }>;
}

interface InvestorsListClientProps {
  investors: InvestorRow[];
}

export function InvestorsListClient({ investors }: InvestorsListClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<InvestorRow | null>(null);

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await deleteInvestor(deleteTarget.id);
    if (!result.error) {
      setDeleteTarget(null);
      startTransition(() => router.refresh());
    }
  }

  const columns: ColumnDef<InvestorRow, unknown>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader column={column}>Name</SortableHeader>
      ),
      cell: ({ row }) => (
        <Link
          href={`/investors/${row.original.id}`}
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
        const t = INVESTOR_TYPE_MAP[row.original.type as InvestorType];
        return t ? (
          <Badge variant="secondary">{t.label}</Badge>
        ) : (
          <span className="text-sm">{row.original.type}</span>
        );
      },
    },
    {
      accessorKey: "accredited",
      header: "Accredited",
      cell: ({ row }) =>
        row.original.accredited ? (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Yes
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">No</span>
        ),
    },
    {
      id: "contact",
      header: "Contact",
      cell: ({ row }) => {
        const c = row.original.contacts;
        if (!c) return <span className="text-muted-foreground">{"\u2014"}</span>;
        return row.original.contact_id ? (
          <Link
            href={`/contacts/${row.original.contact_id}`}
            className="text-primary hover:underline text-sm"
          >
            {c.first_name} {c.last_name}
          </Link>
        ) : (
          <span className="text-sm">
            {c.first_name} {c.last_name}
          </span>
        );
      },
    },
    {
      id: "deals",
      header: "# Deals",
      cell: ({ row }) => {
        const commitments = row.original.investor_commitments ?? [];
        const dealIds = new Set(commitments.map((c) => c.deal_id));
        return <span className="text-sm">{dealIds.size}</span>;
      },
    },
    {
      id: "total_committed",
      header: ({ column }) => (
        <SortableHeader column={column}>Total Committed</SortableHeader>
      ),
      accessorFn: (row) => {
        const commitments = row.investor_commitments ?? [];
        return commitments.reduce((sum, c) => sum + (c.committed_amount ?? 0), 0);
      },
      cell: ({ getValue }) => (
        <span className="text-sm">
          {formatCurrency(getValue() as number)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Link href={`/investors/${row.original.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Link href={`/investors/${row.original.id}/edit`}>
            <Button variant="ghost" size="sm">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investors"
        description="Manage your investors and capital commitments"
      >
        <Link href="/investors/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Investor
          </Button>
        </Link>
      </PageHeader>

      {investors.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="No investors yet"
          description="Add your first investor to start tracking capital."
          action={
            <Link href="/investors/new">
              <Button>
                <Plus className="h-4 w-4" />
                New Investor
              </Button>
            </Link>
          }
        />
      ) : (
        <DataTable columns={columns} data={investors} />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Investor"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
