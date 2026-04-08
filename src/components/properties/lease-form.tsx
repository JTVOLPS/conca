"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { leaseSchema, type LeaseFormData } from "@/lib/schemas/lease";
import { createLease, updateLease } from "@/lib/actions/leases";
import { LEASE_TYPES } from "@/lib/constants/lease-types";
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

interface LeaseData {
  id: string;
  lease_type: string;
  start_date: string;
  end_date?: string | null;
  rent_amount?: number | null;
  rent_frequency?: string | null;
  rent_escalation_pct?: number | null;
  rent_escalation_date?: string | null;
  security_deposit?: number | null;
  cam_charges?: number | null;
  free_rent_months?: number | null;
  renewal_option_terms?: string | null;
  early_termination_terms?: string | null;
  notes?: string | null;
}

interface LeaseFormProps {
  tenantId: string;
  propertyId: string;
  lease?: LeaseData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LeaseForm({
  tenantId,
  propertyId,
  lease,
  open,
  onOpenChange,
  onSuccess,
}: LeaseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(lease?.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeaseFormData>({
    resolver: zodResolver(leaseSchema) as Resolver<LeaseFormData>,
    defaultValues: {
      tenant_id: tenantId,
      property_id: propertyId,
      lease_type:
        (lease?.lease_type as LeaseFormData["lease_type"]) ?? "gross",
      start_date: lease?.start_date ?? "",
      end_date: lease?.end_date ?? "",
      rent_amount: lease?.rent_amount ?? null,
      rent_frequency:
        (lease?.rent_frequency as LeaseFormData["rent_frequency"]) ?? "monthly",
      rent_escalation_pct: lease?.rent_escalation_pct ?? null,
      rent_escalation_date: lease?.rent_escalation_date ?? "",
      security_deposit: lease?.security_deposit ?? null,
      cam_charges: lease?.cam_charges ?? null,
      free_rent_months: lease?.free_rent_months ?? null,
      renewal_option_terms: lease?.renewal_option_terms ?? "",
      early_termination_terms: lease?.early_termination_terms ?? "",
      notes: lease?.notes ?? "",
    },
  });

  const leaseType = watch("lease_type");
  const rentFreq = watch("rent_frequency") ?? "monthly";

  async function onSubmit(data: LeaseFormData) {
    setIsLoading(true);
    setError(null);
    try {
      const result = isEdit
        ? await updateLease(lease!.id, data)
        : await createLease(data);

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
          <DialogTitle>{isEdit ? "Edit Lease" : "Add Lease"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update lease terms and financials."
              : "Create a new lease for this tenant."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("tenant_id")} />
          <input type="hidden" {...register("property_id")} />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Lease Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Lease Type</Label>
                  <Select
                    value={leaseType}
                    onValueChange={(v) =>
                      setValue(
                        "lease_type",
                        v as LeaseFormData["lease_type"]
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEASE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Rent Frequency</Label>
                  <Select
                    value={rentFreq}
                    onValueChange={(v) =>
                      setValue(
                        "rent_frequency",
                        v as LeaseFormData["rent_frequency"]
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="lease-start">Start Date *</Label>
                  <Input
                    id="lease-start"
                    type="date"
                    {...register("start_date")}
                  />
                  {errors.start_date && (
                    <p className="text-xs text-destructive">
                      {errors.start_date.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lease-end">End Date</Label>
                  <Input
                    id="lease-end"
                    type="date"
                    {...register("end_date")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Financials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="lease-rent">Rent Amount ($)</Label>
                  <Input
                    id="lease-rent"
                    type="number"
                    step="0.01"
                    {...register("rent_amount", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lease-cam">CAM Charges ($)</Label>
                  <Input
                    id="lease-cam"
                    type="number"
                    step="0.01"
                    {...register("cam_charges", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="lease-deposit">Security Deposit ($)</Label>
                  <Input
                    id="lease-deposit"
                    type="number"
                    step="0.01"
                    {...register("security_deposit", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lease-free">Free Rent Months</Label>
                  <Input
                    id="lease-free"
                    type="number"
                    step="1"
                    {...register("free_rent_months", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="lease-esc-pct">Escalation %</Label>
                  <Input
                    id="lease-esc-pct"
                    type="number"
                    step="0.01"
                    {...register("rent_escalation_pct", {
                      valueAsNumber: true,
                    })}
                    placeholder="e.g. 3.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lease-esc-date">Escalation Date</Label>
                  <Input
                    id="lease-esc-date"
                    type="date"
                    {...register("rent_escalation_date")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Other</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="lease-renewal">Renewal Options</Label>
                <Textarea
                  id="lease-renewal"
                  {...register("renewal_option_terms")}
                  placeholder="Describe renewal options..."
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lease-termination">Early Termination</Label>
                <Textarea
                  id="lease-termination"
                  {...register("early_termination_terms")}
                  placeholder="Describe termination terms..."
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lease-notes">Notes</Label>
                <Textarea
                  id="lease-notes"
                  {...register("notes")}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

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
              {isEdit ? "Update" : "Create"} Lease
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
