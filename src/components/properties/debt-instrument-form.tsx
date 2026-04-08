"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  debtInstrumentSchema,
  type DebtInstrumentFormData,
} from "@/lib/schemas/debt-instrument";
import {
  createDebtInstrument,
  updateDebtInstrument,
} from "@/lib/actions/debt-instruments";
import { LOAN_TYPES, RATE_TYPES, RECOURSE_TYPES } from "@/lib/constants/loan-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DebtInstrumentData {
  id: string;
  loan_name: string;
  loan_type: string;
  lender_company_id?: string | null;
  recourse?: string | null;
  guarantor?: string | null;
  original_amount?: number | null;
  current_balance?: number | null;
  interest_rate?: number | null;
  rate_type?: string | null;
  spread_over_index?: number | null;
  index_name?: string | null;
  origination_date?: string | null;
  maturity_date?: string | null;
  io_period_months?: number | null;
  amortization_months?: number | null;
  annual_debt_service?: number | null;
  dscr?: number | null;
  ltv_current?: number | null;
  prepayment_terms?: string | null;
  covenants?: Record<string, unknown> | null;
  notes?: string | null;
}

interface DebtInstrumentFormProps {
  propertyId?: string;
  dealId?: string;
  instrument?: DebtInstrumentData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DebtInstrumentForm({
  propertyId,
  dealId,
  instrument,
  open,
  onOpenChange,
  onSuccess,
}: DebtInstrumentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(instrument?.id);

  const covenants = instrument?.covenants ?? {};

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DebtInstrumentFormData>({
    resolver: zodResolver(
      debtInstrumentSchema
    ) as Resolver<DebtInstrumentFormData>,
    defaultValues: {
      property_id: propertyId ?? "",
      deal_id: dealId ?? "",
      loan_name: instrument?.loan_name ?? "",
      loan_type:
        (instrument?.loan_type as DebtInstrumentFormData["loan_type"]) ??
        "permanent",
      lender_company_id: instrument?.lender_company_id ?? "",
      recourse:
        (instrument?.recourse as DebtInstrumentFormData["recourse"]) ?? "",
      guarantor: instrument?.guarantor ?? "",
      original_amount: instrument?.original_amount ?? null,
      current_balance: instrument?.current_balance ?? null,
      interest_rate: instrument?.interest_rate ?? null,
      rate_type:
        (instrument?.rate_type as DebtInstrumentFormData["rate_type"]) ??
        "fixed",
      spread_over_index: instrument?.spread_over_index ?? null,
      index_name: instrument?.index_name ?? "",
      origination_date: instrument?.origination_date ?? "",
      maturity_date: instrument?.maturity_date ?? "",
      io_period_months: instrument?.io_period_months ?? null,
      amortization_months: instrument?.amortization_months ?? null,
      annual_debt_service: instrument?.annual_debt_service ?? null,
      dscr: instrument?.dscr ?? null,
      ltv_current: instrument?.ltv_current ?? null,
      prepayment_terms: instrument?.prepayment_terms ?? "",
      covenants: {
        min_dscr: (covenants.min_dscr as number) ?? undefined,
        max_ltv: (covenants.max_ltv as number) ?? undefined,
        min_occupancy: (covenants.min_occupancy as number) ?? undefined,
      },
      notes: instrument?.notes ?? "",
    },
  });

  const loanType = watch("loan_type");
  const rateType = watch("rate_type") ?? "fixed";
  const recourseValue = watch("recourse") ?? "";

  async function onSubmit(data: DebtInstrumentFormData) {
    setIsLoading(true);
    setError(null);
    try {
      const result = isEdit
        ? await updateDebtInstrument(instrument!.id, data)
        : await createDebtInstrument(data);

      if (result.error) {
        setError(result.error);
      } else {
        reset();
        onOpenChange(false);
        onSuccess?.();
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Debt Instrument" : "Add Debt Instrument"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update loan details."
              : "Add a new debt instrument."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("property_id")} />
          <input type="hidden" {...register("deal_id")} />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Loan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="debt-name">Loan Name *</Label>
                <Input
                  id="debt-name"
                  {...register("loan_name")}
                  placeholder="Loan name"
                />
                {errors.loan_name && (
                  <p className="text-xs text-destructive">
                    {errors.loan_name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Loan Type</Label>
                  <Select
                    value={loanType}
                    onValueChange={(v) =>
                      setValue(
                        "loan_type",
                        v as DebtInstrumentFormData["loan_type"]
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOAN_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Recourse</Label>
                  <Select
                    value={recourseValue}
                    onValueChange={(v) =>
                      setValue(
                        "recourse",
                        v as DebtInstrumentFormData["recourse"]
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recourse" />
                    </SelectTrigger>
                    <SelectContent>
                      {RECOURSE_TYPES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="debt-lender">Lender</Label>
                  <Input
                    id="debt-lender"
                    {...register("lender_company_id")}
                    placeholder="Lender company ID"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="debt-guarantor">Guarantor</Label>
                  <Input
                    id="debt-guarantor"
                    {...register("guarantor")}
                    placeholder="Guarantor name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Amounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="debt-original">Original Amount ($)</Label>
                  <Input
                    id="debt-original"
                    type="number"
                    step="0.01"
                    {...register("original_amount", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="debt-balance">Current Balance ($)</Label>
                  <Input
                    id="debt-balance"
                    type="number"
                    step="0.01"
                    {...register("current_balance", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Rate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="debt-rate">Interest Rate (%)</Label>
                  <Input
                    id="debt-rate"
                    type="number"
                    step="0.001"
                    {...register("interest_rate", { valueAsNumber: true })}
                    placeholder="e.g. 5.25"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Rate Type</Label>
                  <Select
                    value={rateType}
                    onValueChange={(v) =>
                      setValue(
                        "rate_type",
                        v as DebtInstrumentFormData["rate_type"]
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Rate type" />
                    </SelectTrigger>
                    <SelectContent>
                      {RATE_TYPES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="debt-spread">Spread (bps)</Label>
                  <Input
                    id="debt-spread"
                    type="number"
                    step="0.01"
                    {...register("spread_over_index", {
                      valueAsNumber: true,
                    })}
                    placeholder="e.g. 200"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="debt-index">Index Name</Label>
                  <Input
                    id="debt-index"
                    {...register("index_name")}
                    placeholder="e.g. SOFR"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="debt-orig-date">Origination Date</Label>
                  <Input
                    id="debt-orig-date"
                    type="date"
                    {...register("origination_date")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="debt-maturity">Maturity Date</Label>
                  <Input
                    id="debt-maturity"
                    type="date"
                    {...register("maturity_date")}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="debt-io">IO Period (months)</Label>
                  <Input
                    id="debt-io"
                    type="number"
                    step="1"
                    {...register("io_period_months", {
                      valueAsNumber: true,
                    })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="debt-amort">Amortization (months)</Label>
                  <Input
                    id="debt-amort"
                    type="number"
                    step="1"
                    {...register("amortization_months", {
                      valueAsNumber: true,
                    })}
                    placeholder="e.g. 360"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="debt-ads">Annual Debt Service ($)</Label>
                  <Input
                    id="debt-ads"
                    type="number"
                    step="0.01"
                    {...register("annual_debt_service", {
                      valueAsNumber: true,
                    })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="debt-dscr">DSCR</Label>
                  <Input
                    id="debt-dscr"
                    type="number"
                    step="0.01"
                    {...register("dscr", { valueAsNumber: true })}
                    placeholder="e.g. 1.25"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="debt-ltv">LTV (%)</Label>
                  <Input
                    id="debt-ltv"
                    type="number"
                    step="0.01"
                    {...register("ltv_current", { valueAsNumber: true })}
                    placeholder="e.g. 65"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Covenants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cov-dscr">Min DSCR</Label>
                  <Input
                    id="cov-dscr"
                    type="number"
                    step="0.01"
                    {...register("covenants.min_dscr", {
                      valueAsNumber: true,
                    })}
                    placeholder="e.g. 1.20"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cov-ltv">Max LTV (%)</Label>
                  <Input
                    id="cov-ltv"
                    type="number"
                    step="0.01"
                    {...register("covenants.max_ltv", {
                      valueAsNumber: true,
                    })}
                    placeholder="e.g. 75"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cov-occ">Min Occupancy (%)</Label>
                  <Input
                    id="cov-occ"
                    type="number"
                    step="0.01"
                    {...register("covenants.min_occupancy", {
                      valueAsNumber: true,
                    })}
                    placeholder="e.g. 85"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-1.5">
            <Label htmlFor="debt-prepay">Prepayment Terms</Label>
            <Textarea
              id="debt-prepay"
              {...register("prepayment_terms")}
              placeholder="Describe prepayment terms..."
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="debt-notes">Notes</Label>
            <Textarea
              id="debt-notes"
              {...register("notes")}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Update" : "Add"} Instrument
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
