"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, Pencil, Trash2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LOAN_TYPES, LOAN_TYPE_MAP, RATE_TYPES, RECOURSE_TYPES } from "@/lib/constants/loan-types";
import {
  getDebtInstruments,
  createDebtInstrument,
  deleteDebtInstrument,
} from "@/lib/actions/debt-instruments";
import {
  debtInstrumentSchema,
  type DebtInstrumentFormData,
} from "@/lib/schemas/debt-instrument";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DebtRow {
  id: string;
  loan_name: string;
  loan_type: string;
  current_balance: number | null;
  interest_rate: number | null;
  maturity_date: string | null;
  dscr: number | null;
  companies?: { id: string; name: string } | null;
}

interface DealDebtTabProps {
  dealId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DealDebtTab({ dealId }: DealDebtTabProps) {
  const router = useRouter();
  const [instruments, setInstruments] = useState<DebtRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchInstruments = useCallback(async () => {
    setLoading(true);
    const result = await getDebtInstruments({ dealId });
    if (result.error) {
      setError(result.error);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setInstruments(result.data as any as DebtRow[]);
    }
    setLoading(false);
  }, [dealId]);

  useEffect(() => {
    fetchInstruments();
  }, [fetchInstruments]);

  // Summary calculations
  const summary = useMemo(() => {
    const totalDebt = instruments.reduce(
      (sum, i) => sum + (i.current_balance ?? 0),
      0
    );

    // Weighted average rate
    let weightedRateNumerator = 0;
    let weightedRateDenominator = 0;
    for (const i of instruments) {
      if (i.interest_rate != null && i.current_balance != null && i.current_balance > 0) {
        weightedRateNumerator += i.interest_rate * i.current_balance;
        weightedRateDenominator += i.current_balance;
      }
    }
    const weightedAvgRate =
      weightedRateDenominator > 0
        ? weightedRateNumerator / weightedRateDenominator
        : null;

    // Nearest maturity
    const maturities = instruments
      .filter((i) => i.maturity_date)
      .map((i) => i.maturity_date!)
      .sort();
    const nearestMaturity = maturities.length > 0 ? maturities[0] : null;

    return { totalDebt, weightedAvgRate, nearestMaturity };
  }, [instruments]);

  const form = useForm<DebtInstrumentFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(debtInstrumentSchema) as any,
    defaultValues: {
      deal_id: dealId,
      loan_name: "",
      loan_type: "permanent",
      rate_type: "fixed",
      original_amount: null,
      current_balance: null,
      interest_rate: null,
      maturity_date: "",
      dscr: null,
      notes: "",
    },
  });

  function openForm() {
    form.reset({
      deal_id: dealId,
      loan_name: "",
      loan_type: "permanent",
      rate_type: "fixed",
      original_amount: null,
      current_balance: null,
      interest_rate: null,
      maturity_date: "",
      dscr: null,
      notes: "",
    });
    setFormOpen(true);
  }

  async function onSubmit(data: DebtInstrumentFormData) {
    setSubmitting(true);
    const result = await createDebtInstrument({ ...data, deal_id: dealId });
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setFormOpen(false);
    router.refresh();
    fetchInstruments();
  }

  async function handleDelete() {
    if (!deleteId) return;
    await deleteDebtInstrument(deleteId);
    setDeleteId(null);
    router.refresh();
    fetchInstruments();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      {instruments.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Debt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(summary.totalDebt)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Weighted Avg Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {summary.weightedAvgRate != null
                  ? `${summary.weightedAvgRate.toFixed(2)}%`
                  : "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Nearest Maturity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatDate(summary.nearestMaturity)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {instruments.length} instrument{instruments.length !== 1 ? "s" : ""}
        </h3>
        <Button size="sm" onClick={openForm}>
          <Plus className="mr-1 h-4 w-4" />
          Add Debt
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {instruments.length === 0 ? (
        <EmptyState
          icon={<Landmark className="h-5 w-5" />}
          title="No debt instruments"
          description="Add a debt instrument to this deal."
          action={
            <Button size="sm" onClick={openForm}>
              <Plus className="mr-1 h-4 w-4" />
              Add Debt
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Loan Name</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-right font-medium">Balance</th>
                    <th className="px-4 py-3 text-right font-medium">Rate</th>
                    <th className="px-4 py-3 text-left font-medium">Maturity</th>
                    <th className="px-4 py-3 text-right font-medium">DSCR</th>
                    <th className="px-4 py-3 text-left font-medium">Lender</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {instruments.map((inst) => {
                    const loanType =
                      LOAN_TYPE_MAP[
                        inst.loan_type as keyof typeof LOAN_TYPE_MAP
                      ];
                    return (
                      <tr key={inst.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-medium">
                          {inst.loan_name}
                        </td>
                        <td className="px-4 py-3">
                          {loanType ? (
                            <span
                              className={cn(
                                "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                                loanType.color
                              )}
                            >
                              {loanType.label}
                            </span>
                          ) : (
                            <Badge variant="secondary">{inst.loan_type}</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(inst.current_balance)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {inst.interest_rate != null
                            ? `${inst.interest_rate.toFixed(2)}%`
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {formatDate(inst.maturity_date)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {inst.dscr != null ? inst.dscr.toFixed(2) : "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {inst.companies?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(inst.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Debt Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Debt Instrument</DialogTitle>
            <DialogDescription>
              Add a new loan or debt instrument to this deal.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="debt-name">Loan Name *</Label>
              <Input
                id="debt-name"
                {...form.register("loan_name")}
                placeholder="e.g. Senior Acquisition Loan"
              />
              {form.formState.errors.loan_name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.loan_name.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="debt-type">Loan Type *</Label>
                <Select
                  value={form.watch("loan_type")}
                  onValueChange={(val) =>
                    form.setValue(
                      "loan_type",
                      val as DebtInstrumentFormData["loan_type"]
                    )
                  }
                >
                  <SelectTrigger id="debt-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOAN_TYPES.map((lt) => (
                      <SelectItem key={lt.value} value={lt.value}>
                        {lt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="debt-rate-type">Rate Type</Label>
                <Select
                  value={form.watch("rate_type")}
                  onValueChange={(val) =>
                    form.setValue(
                      "rate_type",
                      val as DebtInstrumentFormData["rate_type"]
                    )
                  }
                >
                  <SelectTrigger id="debt-rate-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RATE_TYPES.map((rt) => (
                      <SelectItem key={rt.value} value={rt.value}>
                        {rt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="debt-original">Original Amount</Label>
                <Input
                  id="debt-original"
                  type="number"
                  step="0.01"
                  {...form.register("original_amount")}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="debt-balance">Current Balance</Label>
                <Input
                  id="debt-balance"
                  type="number"
                  step="0.01"
                  {...form.register("current_balance")}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="debt-rate">Interest Rate (%)</Label>
                <Input
                  id="debt-rate"
                  type="number"
                  step="0.01"
                  {...form.register("interest_rate")}
                  placeholder="5.25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="debt-maturity">Maturity Date</Label>
                <Input
                  id="debt-maturity"
                  type="date"
                  {...form.register("maturity_date")}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="debt-dscr">DSCR</Label>
                <Input
                  id="debt-dscr"
                  type="number"
                  step="0.01"
                  {...form.register("dscr")}
                  placeholder="1.25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="debt-recourse">Recourse</Label>
                <Select
                  value={form.watch("recourse") || ""}
                  onValueChange={(val) =>
                    form.setValue(
                      "recourse",
                      val as DebtInstrumentFormData["recourse"]
                    )
                  }
                >
                  <SelectTrigger id="debt-recourse">
                    <SelectValue placeholder="Select recourse" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECOURSE_TYPES.map((rt) => (
                      <SelectItem key={rt.value} value={rt.value}>
                        {rt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="debt-notes">Notes</Label>
              <Textarea
                id="debt-notes"
                {...form.register("notes")}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Instrument"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Debt Instrument"
        description="Are you sure you want to delete this debt instrument? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
