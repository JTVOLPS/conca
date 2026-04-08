"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { tenantSchema, type TenantFormData } from "@/lib/schemas/tenant";
import { createTenant, updateTenant } from "@/lib/actions/tenants";
import { TENANT_STATUSES } from "@/lib/constants/tenant-statuses";
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

interface TenantData {
  id: string;
  name: string;
  unit_label?: string | null;
  status?: string | null;
  occupied_sf?: number | null;
  contact_id?: string | null;
  notes?: string | null;
}

interface TenantFormProps {
  propertyId: string;
  tenant?: TenantData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TenantForm({
  propertyId,
  tenant,
  open,
  onOpenChange,
  onSuccess,
}: TenantFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(tenant?.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema) as Resolver<TenantFormData>,
    defaultValues: {
      property_id: propertyId,
      name: tenant?.name ?? "",
      unit_label: tenant?.unit_label ?? "",
      status: (tenant?.status as TenantFormData["status"]) ?? "active",
      occupied_sf: tenant?.occupied_sf ?? null,
      contact_id: tenant?.contact_id ?? "",
      notes: tenant?.notes ?? "",
    },
  });

  const statusValue = watch("status") ?? "active";

  async function onSubmit(data: TenantFormData) {
    setIsLoading(true);
    setError(null);
    try {
      const result = isEdit
        ? await updateTenant(tenant!.id, data)
        : await createTenant(data);

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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Tenant" : "Add Tenant"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update tenant information."
              : "Add a new tenant to this property."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("property_id")} />

          <div className="space-y-1.5">
            <Label htmlFor="tenant-name">Name *</Label>
            <Input
              id="tenant-name"
              {...register("name")}
              placeholder="Tenant name"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tenant-unit">Unit Label</Label>
            <Input
              id="tenant-unit"
              {...register("unit_label")}
              placeholder="e.g. Suite 101"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={statusValue}
              onValueChange={(v) =>
                setValue("status", v as TenantFormData["status"])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {TENANT_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tenant-sf">Occupied SF</Label>
            <Input
              id="tenant-sf"
              type="number"
              step="any"
              {...register("occupied_sf", { valueAsNumber: true })}
              placeholder="Square feet"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tenant-contact">Contact</Label>
            <Input
              id="tenant-contact"
              {...register("contact_id")}
              placeholder="Contact ID (optional)"
            />
            <p className="text-xs text-muted-foreground">
              Enter a contact ID to link, or leave blank.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tenant-notes">Notes</Label>
            <Textarea
              id="tenant-notes"
              {...register("notes")}
              placeholder="Additional notes..."
              rows={3}
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
              {isEdit ? "Update" : "Add"} Tenant
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
