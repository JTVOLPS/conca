"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  operatingStatementSchema,
  type OperatingStatementFormData,
} from "@/lib/schemas/operating-statement";
import { upsertOperatingStatement } from "@/lib/actions/operating-statements";
import {
  REVENUE_LINE_ITEMS,
  OPERATING_EXPENSE_LINE_ITEMS,
  CAPITAL_EXPENSE_LINE_ITEMS,
} from "@/lib/constants/operating-categories";
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

interface OperatingStatementFormProps {
  propertyId: string;
  year: number;
  month: number;
  statement?: {
    category: string;
    line_item: string;
    actual_amount: number | null;
    budget_amount: number | null;
    notes?: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CATEGORY_OPTIONS = [
  { value: "revenue", label: "Revenue" },
  { value: "operating_expense", label: "Operating Expense" },
  { value: "capital_expense", label: "Capital Expense" },
] as const;

function getLineItemsForCategory(category: string): readonly string[] {
  switch (category) {
    case "revenue":
      return REVENUE_LINE_ITEMS;
    case "operating_expense":
      return OPERATING_EXPENSE_LINE_ITEMS;
    case "capital_expense":
      return CAPITAL_EXPENSE_LINE_ITEMS;
    default:
      return [];
  }
}

export function OperatingStatementForm({
  propertyId,
  year,
  month,
  statement,
  open,
  onOpenChange,
  onSuccess,
}: OperatingStatementFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<OperatingStatementFormData>({
    resolver: zodResolver(
      operatingStatementSchema
    ) as Resolver<OperatingStatementFormData>,
    defaultValues: {
      property_id: propertyId,
      period_year: year,
      period_month: month,
      category:
        (statement?.category as OperatingStatementFormData["category"]) ??
        "revenue",
      line_item: statement?.line_item ?? "",
      actual_amount: statement?.actual_amount ?? null,
      budget_amount: statement?.budget_amount ?? null,
      notes: statement?.notes ?? "",
    },
  });

  const selectedCategory = watch("category");
  const lineItems = getLineItemsForCategory(selectedCategory);

  async function onSubmit(data: OperatingStatementFormData) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await upsertOperatingStatement(data);
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
          <DialogTitle>
            {statement ? "Edit Line Item" : "Add Line Item"}
          </DialogTitle>
          <DialogDescription>
            {statement
              ? "Update the operating statement entry."
              : `Add a new entry for ${new Date(year, month - 1).toLocaleString("en-US", { month: "long" })} ${year}.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("property_id")} />
          <input
            type="hidden"
            {...register("period_year", { valueAsNumber: true })}
          />
          <input
            type="hidden"
            {...register("period_month", { valueAsNumber: true })}
          />

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={(v) =>
                setValue(
                  "category",
                  v as OperatingStatementFormData["category"]
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Line Item</Label>
            {lineItems.length > 0 ? (
              <Select
                value={watch("line_item")}
                onValueChange={(v) => setValue("line_item", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select line item" />
                </SelectTrigger>
                <SelectContent>
                  {lineItems.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                {...register("line_item")}
                placeholder="Enter line item name"
              />
            )}
            {errors.line_item && (
              <p className="text-xs text-destructive">
                {errors.line_item.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="os-actual">Actual Amount ($)</Label>
              <Input
                id="os-actual"
                type="number"
                step="0.01"
                {...register("actual_amount", { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="os-budget">Budget Amount ($)</Label>
              <Input
                id="os-budget"
                type="number"
                step="0.01"
                {...register("budget_amount", { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="os-notes">Notes</Label>
            <Textarea
              id="os-notes"
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
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
