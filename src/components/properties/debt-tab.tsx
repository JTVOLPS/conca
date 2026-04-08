"use client";

import { useState, useEffect, useCallback } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Pencil,
  Trash2,
  DollarSign,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  getDebtInstruments,
  deleteDebtInstrument,
} from "@/lib/actions/debt-instruments";
import {
  LOAN_TYPE_MAP,
  RATE_TYPE_MAP,
  type LoanType,
  type RateType,
} from "@/lib/constants/loan-types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, SortableHeader } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DebtInstrumentForm } from "./debt-instrument-form";

interface DebtRow {
  id: string;
  loan_name: string;
  loan_type: string;
  current_balance: number | null;
  original_amount: number | null;
  interest_rate: number | null;
  rate_type: string | null;
  maturity_date: string | null;
  dscr: number | null;
  ltv_current: number | null;
  annual_debt_service: number | null;
  lender_company_id?: string | null;
  recourse?: string | null;
  guarantor?: string | null;
  spread_over_index?: number | null;
  index_name?: string | null;
  origination_date?: string | null;
  io_period_months?: number | null;
  amortization_months?: number | null;
  prepayment_terms?: string | null;
  covenants?: Record<string, unknown> | null;
  notes?: string | null;
  companies?: { id: string; name: string } | null;
}

interface DebtTabProps {
  propertyId?: string;
  dealId?: string;
}

export function DebtTab({ propertyId, dealId }: DebtTabProps) {
  const [instruments, setInstruments] = useState<DebtRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<DebtRow | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<DebtRow | null>(null);

  const loadInstruments = useCallback(async () => {
    setLoading(true);
    const result = await getDebtInstruments({ propertyId, dealId });
    setInstruments((result.data ?? []) as unknown as DebtRow[]);
    setLoading(false);
  }, [propertyId, dealId]);

  useEffect(() => {
    loadInstruments();
  }, [loadInstruments]);

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteDebtInstrument(deleteTarget.id);
    setDeleteTarget(null);
    loadInstruments();
  }

  // Summary stats
  const totalDebt = instruments.reduce(
    (s, i) => s + (i.current_balance ?? 0),
    0
  );

  // Weighted average rate
  let weightedRate: number | null = null;
  const totalBalanceWithRate = instruments.reduce((s, i) => {
    if (i.current_balance && i.interest_rate) return s + i.current_balance;
    return s;
  }, 0);
  if (totalBalanceWithRate > 0) {
    const weightedSum = instruments.reduce((s, i) => {
      if (i.current_balance && i.interest_rate)
        return s + i.current_balance * i.interest_rate;
      return s;
    }, 0);
    weightedRate = weightedSum / totalBalanceWithRate;
  }

  // Nearest maturity
  const nearestMaturity = instruments
    .filter((i) => i.maturity_date)
    .sort(
      (a, b) =>
        new Date(a.maturity_date!).getTime() -
        new Date(b.maturity_date!).getTime()
    )[0]?.maturity_date;

  const columns: ColumnDef<DebtRow, unknown>[] = [
    {
      accessorKey: "loan_name",
      header: ({ column }) => (
        <SortableHeader column={column}>Loan Name</SortableHeader>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm font-medium">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "loan_type",
      header: "Type",
      cell: ({ getValue }) => {
        const type = getValue() as LoanType;
        const t = LOAN_TYPE_MAP[type];
        return t ? (
          <Badge className={t.color}>{t.label}</Badge>
        ) : (
          <span className="text-sm">{type}</span>
        );
      },
    },
    {
      accessorKey: "current_balance",
      header: ({ column }) => (
        <SortableHeader column={column}>Current Balance</SortableHeader>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm">
          {formatCurrency(getValue() as number | null)}
        </span>
      ),
    },
    {
      accessorKey: "interest_rate",
      header: ({ column }) => (
        <SortableHeader column={column}>Interest Rate</SortableHeader>
      ),
      cell: ({ getValue }) => {
        const rate = getValue() as number | null;
        return (
          <span className="text-sm">
            {rate != null ? `${rate.toFixed(2)}%` : "---"}
          </span>
        );
      },
    },
    {
      accessorKey: "rate_type",
      header: "Rate Type",
      cell: ({ getValue }) => {
        const rt = getValue() as RateType | null;
        if (!rt) return <span className="text-sm">---</span>;
        const r = RATE_TYPE_MAP[rt];
        return r ? (
          <Badge className={r.color}>{r.label}</Badge>
        ) : (
          <span className="text-sm">{rt}</span>
        );
      },
    },
    {
      accessorKey: "maturity_date",
      header: ({ column }) => (
        <SortableHeader column={column}>Maturity Date</SortableHeader>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm">
          {formatDate(getValue() as string | null)}
        </span>
      ),
    },
    {
      accessorKey: "dscr",
      header: "DSCR",
      cell: ({ getValue }) => {
        const dscr = getValue() as number | null;
        return (
          <span className="text-sm">
            {dscr != null ? dscr.toFixed(2) : "---"}
          </span>
        );
      },
    },
    {
      accessorKey: "ltv_current",
      header: "LTV",
      cell: ({ getValue }) => {
        const ltv = getValue() as number | null;
        return (
          <span className="text-sm">
            {ltv != null ? `${ltv.toFixed(1)}%` : "---"}
          </span>
        );
      },
    },
    {
      id: "lender",
      header: "Lender",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.companies?.name || "---"}
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
              setEditingInstrument(row.original);
              setFormOpen(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading debt instruments...
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Debt</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalDebt)}
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
                <p className="text-sm text-muted-foreground">
                  Weighted Avg Rate
                </p>
                <p className="text-2xl font-bold">
                  {weightedRate != null
                    ? `${weightedRate.toFixed(2)}%`
                    : "---"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Nearest Maturity
                </p>
                <p className="text-2xl font-bold">
                  {nearestMaturity ? formatDate(nearestMaturity) : "---"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Debt Instruments</h3>
          <Button
            size="sm"
            onClick={() => {
              setEditingInstrument(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Debt
          </Button>
        </div>

        {instruments.length === 0 ? (
          <EmptyState
            icon={<DollarSign className="h-6 w-6" />}
            title="No debt instruments"
            description="Add your first debt instrument to track financing."
            action={
              <Button
                size="sm"
                onClick={() => {
                  setEditingInstrument(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Debt
              </Button>
            }
          />
        ) : (
          <DataTable columns={columns} data={instruments} />
        )}
      </div>

      {/* Dialogs */}
      <DebtInstrumentForm
        propertyId={propertyId}
        dealId={dealId}
        instrument={editingInstrument}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingInstrument(null);
        }}
        onSuccess={loadInstruments}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Debt Instrument"
        description={`Are you sure you want to delete "${deleteTarget?.loan_name}"?`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
