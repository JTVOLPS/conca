"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Loader2,
  Trash2,
  Pencil,
  DollarSign,
  Users,
  TrendingUp,
} from "lucide-react";
import {
  getCommitmentsByDeal,
  deleteCommitment,
} from "@/lib/actions/commitments";
import {
  getDistributionsByDeal,
  deleteDistribution,
} from "@/lib/actions/distributions";
import {
  COMMITMENT_STATUS_MAP,
  type CommitmentStatus,
} from "@/lib/constants/commitment-statuses";
import {
  DISTRIBUTION_TYPE_MAP,
  type DistributionType,
} from "@/lib/constants/distribution-types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable, SortableHeader } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CommitmentForm } from "@/components/investors/commitment-form";
import { DistributionForm } from "@/components/investors/distribution-form";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CommitmentRow {
  id: string;
  investor_id: string;
  deal_id: string;
  committed_amount: number;
  called_amount: number;
  status: string;
  commitment_date: string | null;
  notes: string | null;
  investors: { name: string } | null;
}

interface DistributionRow {
  id: string;
  investor_id: string;
  deal_id: string;
  commitment_id: string | null;
  distribution_date: string;
  amount: number;
  type: string;
  period_label: string | null;
  notes: string | null;
  investors: { name: string } | null;
}

interface DealEconomics {
  total_equity?: number | null;
  gp_equity?: number | null;
  lp_equity?: number | null;
  [key: string]: unknown;
}

interface DealInvestorsTabProps {
  dealId: string;
  economics?: DealEconomics | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DealInvestorsTab({
  dealId,
  economics,
}: DealInvestorsTabProps) {
  const router = useRouter();
  const [commitments, setCommitments] = useState<CommitmentRow[]>([]);
  const [distributions, setDistributions] = useState<DistributionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [commitmentFormOpen, setCommitmentFormOpen] = useState(false);
  const [editingCommitment, setEditingCommitment] =
    useState<CommitmentRow | null>(null);
  const [distributionFormOpen, setDistributionFormOpen] = useState(false);
  const [editingDistribution, setEditingDistribution] =
    useState<DistributionRow | null>(null);
  const [deleteCommitmentTarget, setDeleteCommitmentTarget] =
    useState<CommitmentRow | null>(null);
  const [deleteDistributionTarget, setDeleteDistributionTarget] =
    useState<DistributionRow | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [commitmentsResult, distributionsResult] = await Promise.all([
      getCommitmentsByDeal(dealId),
      getDistributionsByDeal(dealId),
    ]);
    setCommitments(commitmentsResult.data as unknown as CommitmentRow[]);
    setDistributions(distributionsResult.data as unknown as DistributionRow[]);
    setLoading(false);
  }, [dealId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Summary values
  const totalEquity = economics?.total_equity ?? null;
  const gpEquity = economics?.gp_equity ?? null;
  const lpEquity = economics?.lp_equity ?? null;
  const totalCommitted = commitments.reduce(
    (s, c) => s + (c.committed_amount ?? 0),
    0
  );

  async function handleDeleteCommitment() {
    if (!deleteCommitmentTarget) return;
    await deleteCommitment(deleteCommitmentTarget.id);
    setDeleteCommitmentTarget(null);
    router.refresh();
    fetchData();
  }

  async function handleDeleteDistribution() {
    if (!deleteDistributionTarget) return;
    await deleteDistribution(deleteDistributionTarget.id);
    setDeleteDistributionTarget(null);
    router.refresh();
    fetchData();
  }

  function handleCommitmentSuccess() {
    setCommitmentFormOpen(false);
    setEditingCommitment(null);
    router.refresh();
    fetchData();
  }

  function handleDistributionSuccess() {
    setDistributionFormOpen(false);
    setEditingDistribution(null);
    router.refresh();
    fetchData();
  }

  // Commitment columns
  const commitmentColumns: ColumnDef<CommitmentRow, unknown>[] = [
    {
      id: "investor",
      header: "Investor",
      cell: ({ row }) =>
        row.original.investors ? (
          <Link
            href={`/investors/${row.original.investor_id}`}
            className="text-primary hover:underline text-sm font-medium"
          >
            {row.original.investors.name}
          </Link>
        ) : (
          <span className="text-muted-foreground">{"\u2014"}</span>
        ),
    },
    {
      accessorKey: "committed_amount",
      header: ({ column }) => (
        <SortableHeader column={column}>Committed</SortableHeader>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm">
          {formatCurrency(getValue() as number)}
        </span>
      ),
    },
    {
      accessorKey: "called_amount",
      header: "Called",
      cell: ({ getValue }) => (
        <span className="text-sm">
          {formatCurrency(getValue() as number)}
        </span>
      ),
    },
    {
      id: "remaining",
      header: "Remaining",
      cell: ({ row }) => (
        <span className="text-sm">
          {formatCurrency(
            row.original.committed_amount - row.original.called_amount
          )}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as CommitmentStatus;
        const s = COMMITMENT_STATUS_MAP[status];
        return s ? (
          <Badge className={s.color}>{s.label}</Badge>
        ) : (
          <Badge variant="secondary">{status}</Badge>
        );
      },
    },
    {
      accessorKey: "commitment_date",
      header: ({ column }) => (
        <SortableHeader column={column}>Date</SortableHeader>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm">
          {formatDate(getValue() as string | null)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingCommitment(row.original);
              setCommitmentFormOpen(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteCommitmentTarget(row.original)}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  // Distribution columns
  const distributionColumns: ColumnDef<DistributionRow, unknown>[] = [
    {
      id: "investor",
      header: "Investor",
      cell: ({ row }) =>
        row.original.investors ? (
          <Link
            href={`/investors/${row.original.investor_id}`}
            className="text-primary hover:underline text-sm font-medium"
          >
            {row.original.investors.name}
          </Link>
        ) : (
          <span className="text-muted-foreground">{"\u2014"}</span>
        ),
    },
    {
      accessorKey: "distribution_date",
      header: ({ column }) => (
        <SortableHeader column={column}>Date</SortableHeader>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm">
          {formatDate(getValue() as string)}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <SortableHeader column={column}>Amount</SortableHeader>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm">
          {formatCurrency(getValue() as number)}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ getValue }) => {
        const type = getValue() as DistributionType;
        const t = DISTRIBUTION_TYPE_MAP[type];
        return t ? (
          <Badge variant="secondary">{t.label}</Badge>
        ) : (
          <Badge variant="secondary">{type}</Badge>
        );
      },
    },
    {
      accessorKey: "period_label",
      header: "Period",
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">
          {(getValue() as string | null) || "\u2014"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingDistribution(row.original);
              setDistributionFormOpen(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteDistributionTarget(row.original)}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Capital Stack Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Equity</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalEquity)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">GP Equity</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(gpEquity)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">LP Equity</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(lpEquity)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Committed
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalCommitted)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commitments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Commitments</h3>
          <Button
            size="sm"
            onClick={() => {
              setEditingCommitment(null);
              setCommitmentFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Commitment
          </Button>
        </div>

        {commitments.length === 0 ? (
          <EmptyState
            icon={<DollarSign className="h-6 w-6" />}
            title="No commitments"
            description="Add investor commitments for this deal."
            action={
              <Button
                size="sm"
                onClick={() => {
                  setEditingCommitment(null);
                  setCommitmentFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Commitment
              </Button>
            }
          />
        ) : (
          <DataTable columns={commitmentColumns} data={commitments} />
        )}
      </div>

      {/* Distributions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Distributions</h3>
          <Button
            size="sm"
            onClick={() => {
              setEditingDistribution(null);
              setDistributionFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Distribution
          </Button>
        </div>

        {distributions.length === 0 ? (
          <EmptyState
            icon={<DollarSign className="h-6 w-6" />}
            title="No distributions"
            description="Record distributions for this deal."
            action={
              <Button
                size="sm"
                onClick={() => {
                  setEditingDistribution(null);
                  setDistributionFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Distribution
              </Button>
            }
          />
        ) : (
          <DataTable columns={distributionColumns} data={distributions} />
        )}
      </div>

      {/* Dialogs */}
      <CommitmentForm
        dealId={dealId}
        commitment={
          editingCommitment
            ? {
                ...editingCommitment,
                notes: editingCommitment.notes ?? null,
              }
            : null
        }
        open={commitmentFormOpen}
        onOpenChange={(open) => {
          setCommitmentFormOpen(open);
          if (!open) setEditingCommitment(null);
        }}
        onSuccess={handleCommitmentSuccess}
      />

      <DistributionForm
        dealId={dealId}
        distribution={
          editingDistribution
            ? {
                ...editingDistribution,
                notes: editingDistribution.notes ?? null,
              }
            : null
        }
        open={distributionFormOpen}
        onOpenChange={(open) => {
          setDistributionFormOpen(open);
          if (!open) setEditingDistribution(null);
        }}
        onSuccess={handleDistributionSuccess}
      />

      <ConfirmDialog
        open={deleteCommitmentTarget !== null}
        onOpenChange={(open) => !open && setDeleteCommitmentTarget(null)}
        title="Delete Commitment"
        description="Are you sure you want to delete this commitment? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteCommitment}
      />

      <ConfirmDialog
        open={deleteDistributionTarget !== null}
        onOpenChange={(open) => !open && setDeleteDistributionTarget(null)}
        title="Delete Distribution"
        description="Are you sure you want to delete this distribution? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteDistribution}
      />
    </div>
  );
}
