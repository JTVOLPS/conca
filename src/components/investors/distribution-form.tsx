"use client";

import { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  distributionSchema,
  type DistributionFormData,
} from "@/lib/schemas/investor";
import {
  createDistribution,
  updateDistribution,
} from "@/lib/actions/distributions";
import { DISTRIBUTION_TYPES } from "@/lib/constants/distribution-types";
import { getInvestors } from "@/lib/actions/investors";
import { getDeals } from "@/lib/actions/deals";
import { getCommitmentsByInvestor } from "@/lib/actions/commitments";
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

interface DistributionData {
  id: string;
  investor_id: string;
  deal_id: string;
  commitment_id: string | null;
  distribution_date: string;
  amount: number;
  type: string;
  period_label: string | null;
  notes: string | null;
}

interface CommitmentOption {
  id: string;
  deal_id: string;
  committed_amount: number;
  deals?: { name: string } | null;
}

interface DistributionFormProps {
  investorId?: string;
  dealId?: string;
  distribution?: DistributionData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DistributionForm({
  investorId,
  dealId,
  distribution,
  open,
  onOpenChange,
  onSuccess,
}: DistributionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [investors, setInvestors] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [deals, setDeals] = useState<Array<{ id: string; name: string }>>([]);
  const [commitments, setCommitments] = useState<CommitmentOption[]>([]);
  const isEdit = Boolean(distribution?.id);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const [investorsResult, dealsResult] = await Promise.all([
        getInvestors(),
        getDeals({ pageSize: 200 }),
      ]);
      setInvestors(
        (investorsResult.data ?? []).map((i: Record<string, unknown>) => ({
          id: i.id as string,
          name: i.name as string,
        }))
      );
      setDeals(
        (dealsResult.data ?? []).map((d: Record<string, unknown>) => ({
          id: d.id as string,
          name: d.name as string,
        }))
      );

      // Fetch commitments for the investor
      const invId = distribution?.investor_id ?? investorId;
      if (invId) {
        const commitmentsResult = await getCommitmentsByInvestor(invId);
        setCommitments(commitmentsResult.data as unknown as CommitmentOption[]);
      }
    })();
  }, [open, distribution?.investor_id, investorId]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DistributionFormData>({
    resolver: zodResolver(distributionSchema) as Resolver<DistributionFormData>,
    defaultValues: {
      investor_id: distribution?.investor_id ?? investorId ?? "",
      deal_id: distribution?.deal_id ?? dealId ?? "",
      commitment_id: distribution?.commitment_id ?? "",
      distribution_date: distribution?.distribution_date ?? "",
      amount: distribution?.amount ?? 0,
      type:
        (distribution?.type as DistributionFormData["type"]) ??
        "preferred_return",
      period_label: distribution?.period_label ?? "",
      notes: distribution?.notes ?? "",
    },
  });

  // Reset form when distribution changes
  useEffect(() => {
    if (open) {
      reset({
        investor_id: distribution?.investor_id ?? investorId ?? "",
        deal_id: distribution?.deal_id ?? dealId ?? "",
        commitment_id: distribution?.commitment_id ?? "",
        distribution_date: distribution?.distribution_date ?? "",
        amount: distribution?.amount ?? 0,
        type:
          (distribution?.type as DistributionFormData["type"]) ??
          "preferred_return",
        period_label: distribution?.period_label ?? "",
        notes: distribution?.notes ?? "",
      });
      setError(null);
    }
  }, [open, distribution, investorId, dealId, reset]);

  const typeValue = watch("type");
  const watchedInvestorId = watch("investor_id");

  // Reload commitments when investor changes
  useEffect(() => {
    if (watchedInvestorId) {
      (async () => {
        const result = await getCommitmentsByInvestor(watchedInvestorId);
        setCommitments(result.data as unknown as CommitmentOption[]);
      })();
    }
  }, [watchedInvestorId]);

  async function onSubmit(data: DistributionFormData) {
    setIsLoading(true);
    setError(null);
    try {
      const result = isEdit
        ? await updateDistribution(distribution!.id, data)
        : await createDistribution(data);

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
            {isEdit ? "Edit Distribution" : "Add Distribution"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update distribution details."
              : "Record a new distribution."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!investorId && (
            <div className="space-y-1.5">
              <Label>Investor *</Label>
              <Select
                value={watch("investor_id")}
                onValueChange={(val) => setValue("investor_id", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select investor" />
                </SelectTrigger>
                <SelectContent>
                  {investors.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.investor_id && (
                <p className="text-xs text-destructive">
                  {errors.investor_id.message}
                </p>
              )}
            </div>
          )}

          {!dealId && (
            <div className="space-y-1.5">
              <Label>Deal *</Label>
              <Select
                value={watch("deal_id")}
                onValueChange={(val) => setValue("deal_id", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select deal" />
                </SelectTrigger>
                <SelectContent>
                  {deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.deal_id && (
                <p className="text-xs text-destructive">
                  {errors.deal_id.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Commitment (optional)</Label>
            <Select
              value={watch("commitment_id") ?? ""}
              onValueChange={(val) =>
                setValue("commitment_id", val === "__none__" ? "" : val)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select commitment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {commitments.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.deals?.name ?? "Unknown deal"} -{" "}
                    ${(c.committed_amount ?? 0).toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dist-date">Distribution Date *</Label>
              <Input
                id="dist-date"
                type="date"
                {...register("distribution_date")}
              />
              {errors.distribution_date && (
                <p className="text-xs text-destructive">
                  {errors.distribution_date.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dist-amount">Amount ($) *</Label>
              <Input
                id="dist-amount"
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-xs text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={typeValue}
                onValueChange={(val) =>
                  setValue("type", val as DistributionFormData["type"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {DISTRIBUTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dist-period">Period Label</Label>
              <Input
                id="dist-period"
                {...register("period_label")}
                placeholder="e.g. Q1 2025"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dist-notes">Notes</Label>
            <Textarea
              id="dist-notes"
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
              {isEdit ? "Update" : "Add"} Distribution
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
