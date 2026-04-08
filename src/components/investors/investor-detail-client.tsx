"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeft,
  Edit,
  MapPin,
  Trash2,
  DollarSign,
  Plus,
} from "lucide-react";
import { deleteInvestor } from "@/lib/actions/investors";
import { deleteCommitment } from "@/lib/actions/commitments";
import { deleteDistribution } from "@/lib/actions/distributions";
import { INVESTOR_TYPE_MAP, type InvestorType } from "@/lib/constants/investor-types";
import {
  COMMITMENT_STATUS_MAP,
  type CommitmentStatus,
} from "@/lib/constants/commitment-statuses";
import {
  DISTRIBUTION_TYPE_MAP,
  type DistributionType,
} from "@/lib/constants/distribution-types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, SortableHeader } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CommitmentForm } from "@/components/investors/commitment-form";
import { DistributionForm } from "@/components/investors/distribution-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Investor {
  id: string;
  name: string;
  type: string;
  accredited: boolean;
  contact_id: string | null;
  company_id: string | null;
  entity_name: string | null;
  tax_id: string | null;
  address_line1: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  notes: string | null;
  created_at: string;
  contacts: { first_name: string; last_name: string } | null;
  companies: { name: string } | null;
}

interface CommitmentRow {
  id: string;
  investor_id: string;
  deal_id: string;
  committed_amount: number;
  called_amount: number;
  status: string;
  commitment_date: string | null;
  notes: string | null;
  deals: { name: string } | null;
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
  deals: { name: string } | null;
}

interface InvestorDetailClientProps {
  investor: Investor;
  commitments: CommitmentRow[];
  distributions: DistributionRow[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InvestorDetailClient({
  investor,
  commitments,
  distributions,
}: InvestorDetailClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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

  const typeLabel =
    INVESTOR_TYPE_MAP[investor.type as InvestorType]?.label ?? investor.type;

  const hasAddress =
    investor.address_line1 ||
    investor.address_city ||
    investor.address_state ||
    investor.address_zip;

  const addressParts = [
    investor.address_line1,
    [investor.address_city, investor.address_state].filter(Boolean).join(", "),
    investor.address_zip,
  ].filter(Boolean);

  // Summary calculations
  const totalCommitted = commitments.reduce(
    (s, c) => s + (c.committed_amount ?? 0),
    0
  );
  const totalCalled = commitments.reduce(
    (s, c) => s + (c.called_amount ?? 0),
    0
  );
  const totalDistributed = distributions.reduce(
    (s, d) => s + (d.amount ?? 0),
    0
  );

  async function handleDelete() {
    const result = await deleteInvestor(investor.id);
    if (!result.error) {
      router.push("/investors");
    }
  }

  async function handleDeleteCommitment() {
    if (!deleteCommitmentTarget) return;
    await deleteCommitment(deleteCommitmentTarget.id);
    setDeleteCommitmentTarget(null);
    startTransition(() => router.refresh());
  }

  async function handleDeleteDistribution() {
    if (!deleteDistributionTarget) return;
    await deleteDistribution(deleteDistributionTarget.id);
    setDeleteDistributionTarget(null);
    startTransition(() => router.refresh());
  }

  function handleCommitmentSuccess() {
    setCommitmentFormOpen(false);
    setEditingCommitment(null);
    startTransition(() => router.refresh());
  }

  function handleDistributionSuccess() {
    setDistributionFormOpen(false);
    setEditingDistribution(null);
    startTransition(() => router.refresh());
  }

  // Commitment columns
  const commitmentColumns: ColumnDef<CommitmentRow, unknown>[] = [
    {
      id: "deal",
      header: "Deal",
      cell: ({ row }) =>
        row.original.deals ? (
          <Link
            href={`/deals/${row.original.deal_id}`}
            className="text-primary hover:underline text-sm font-medium"
          >
            {row.original.deals.name}
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
            <Edit className="h-3.5 w-3.5" />
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
      id: "deal",
      header: "Deal",
      cell: ({ row }) =>
        row.original.deals ? (
          <Link
            href={`/deals/${row.original.deal_id}`}
            className="text-primary hover:underline text-sm font-medium"
          >
            {row.original.deals.name}
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
            <Edit className="h-3.5 w-3.5" />
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader title={investor.name} description={typeLabel}>
        <Link href="/investors">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <Link href={`/investors/${investor.id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </Link>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </PageHeader>

      {/* Quick Info */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="secondary">{typeLabel}</Badge>
        {investor.accredited && (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Accredited
          </Badge>
        )}
        {investor.contacts && investor.contact_id && (
          <Link
            href={`/contacts/${investor.contact_id}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Contact: {investor.contacts.first_name}{" "}
            {investor.contacts.last_name}
          </Link>
        )}
        {investor.companies && (
          <span className="text-sm text-muted-foreground">
            Company: {investor.companies.name}
          </span>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="commitments">
            Commitments ({commitments.length})
          </TabsTrigger>
          <TabsTrigger value="distributions">
            Distributions ({distributions.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-3 mt-4">
            {/* Summary cards */}
            <div className="lg:col-span-3 grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Committed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalCommitted)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Called
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalCalled)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Distributed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalDistributed)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detail cards */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Investor Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Name</dt>
                      <dd>{investor.name}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Type</dt>
                      <dd>{typeLabel}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Accredited</dt>
                      <dd>{investor.accredited ? "Yes" : "No"}</dd>
                    </div>
                    {investor.entity_name && (
                      <div>
                        <dt className="text-muted-foreground">Entity Name</dt>
                        <dd>{investor.entity_name}</dd>
                      </div>
                    )}
                    {investor.contacts && (
                      <div>
                        <dt className="text-muted-foreground">Contact</dt>
                        <dd>
                          {investor.contact_id ? (
                            <Link
                              href={`/contacts/${investor.contact_id}`}
                              className="text-primary hover:underline"
                            >
                              {investor.contacts.first_name}{" "}
                              {investor.contacts.last_name}
                            </Link>
                          ) : (
                            `${investor.contacts.first_name} ${investor.contacts.last_name}`
                          )}
                        </dd>
                      </div>
                    )}
                    {investor.companies && (
                      <div>
                        <dt className="text-muted-foreground">Company</dt>
                        <dd>{investor.companies.name}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-muted-foreground">Created</dt>
                      <dd>{formatDate(investor.created_at)}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {hasAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        {addressParts.map((part, i) => (
                          <div key={i}>{part}</div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {investor.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">
                      {investor.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Commitments Tab */}
        <TabsContent value="commitments">
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                {commitments.length} commitment
                {commitments.length !== 1 ? "s" : ""}
              </h3>
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
                icon={<DollarSign className="h-5 w-5" />}
                title="No commitments"
                description="Add a capital commitment for this investor."
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
        </TabsContent>

        {/* Distributions Tab */}
        <TabsContent value="distributions">
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                {distributions.length} distribution
                {distributions.length !== 1 ? "s" : ""}
              </h3>
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
                icon={<DollarSign className="h-5 w-5" />}
                title="No distributions"
                description="Record a distribution for this investor."
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
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CommitmentForm
        investorId={investor.id}
        commitment={editingCommitment}
        open={commitmentFormOpen}
        onOpenChange={(open) => {
          setCommitmentFormOpen(open);
          if (!open) setEditingCommitment(null);
        }}
        onSuccess={handleCommitmentSuccess}
      />

      <DistributionForm
        investorId={investor.id}
        distribution={editingDistribution}
        open={distributionFormOpen}
        onOpenChange={(open) => {
          setDistributionFormOpen(open);
          if (!open) setEditingDistribution(null);
        }}
        onSuccess={handleDistributionSuccess}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Investor"
        description={`Are you sure you want to delete "${investor.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
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
