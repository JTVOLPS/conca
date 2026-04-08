"use client";

import { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  commitmentSchema,
  type CommitmentFormData,
} from "@/lib/schemas/investor";
import {
  createCommitment,
  updateCommitment,
} from "@/lib/actions/commitments";
import { COMMITMENT_STATUSES } from "@/lib/constants/commitment-statuses";
import { getInvestors } from "@/lib/actions/investors";
import { getDeals } from "@/lib/actions/deals";
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

interface CommitmentData {
  id: string;
  investor_id: string;
  deal_id: string;
  committed_amount: number;
  called_amount: number;
  status: string;
  commitment_date: string | null;
  notes: string | null;
}

interface CommitmentFormProps {
  investorId?: string;
  dealId?: string;
  commitment?: CommitmentData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CommitmentForm({
  investorId,
  dealId,
  commitment,
  open,
  onOpenChange,
  onSuccess,
}: CommitmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [investors, setInvestors] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [deals, setDeals] = useState<Array<{ id: string; name: string }>>([]);
  const isEdit = Boolean(commitment?.id);

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
    })();
  }, [open]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CommitmentFormData>({
    resolver: zodResolver(commitmentSchema) as Resolver<CommitmentFormData>,
    defaultValues: {
      investor_id: commitment?.investor_id ?? investorId ?? "",
      deal_id: commitment?.deal_id ?? dealId ?? "",
      committed_amount: commitment?.committed_amount ?? 0,
      called_amount: commitment?.called_amount ?? 0,
      status:
        (commitment?.status as CommitmentFormData["status"]) ?? "committed",
      commitment_date: commitment?.commitment_date ?? "",
      notes: commitment?.notes ?? "",
    },
  });

  // Reset form when commitment changes
  useEffect(() => {
    if (open) {
      reset({
        investor_id: commitment?.investor_id ?? investorId ?? "",
        deal_id: commitment?.deal_id ?? dealId ?? "",
        committed_amount: commitment?.committed_amount ?? 0,
        called_amount: commitment?.called_amount ?? 0,
        status:
          (commitment?.status as CommitmentFormData["status"]) ?? "committed",
        commitment_date: commitment?.commitment_date ?? "",
        notes: commitment?.notes ?? "",
      });
      setError(null);
    }
  }, [open, commitment, investorId, dealId, reset]);

  const statusValue = watch("status");

  async function onSubmit(data: CommitmentFormData) {
    setIsLoading(true);
    setError(null);
    try {
      const result = isEdit
        ? await updateCommitment(commitment!.id, data)
        : await createCommitment(data);

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
            {isEdit ? "Edit Commitment" : "Add Commitment"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update commitment details."
              : "Add a new capital commitment."}
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="committed-amount">Committed Amount ($) *</Label>
              <Input
                id="committed-amount"
                type="number"
                step="0.01"
                {...register("committed_amount", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.committed_amount && (
                <p className="text-xs text-destructive">
                  {errors.committed_amount.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="called-amount">Called Amount ($)</Label>
              <Input
                id="called-amount"
                type="number"
                step="0.01"
                {...register("called_amount", { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={statusValue}
                onValueChange={(val) =>
                  setValue("status", val as CommitmentFormData["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {COMMITMENT_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="commitment-date">Commitment Date</Label>
              <Input
                id="commitment-date"
                type="date"
                {...register("commitment_date")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="commitment-notes">Notes</Label>
            <Textarea
              id="commitment-notes"
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
              {isEdit ? "Update" : "Add"} Commitment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
