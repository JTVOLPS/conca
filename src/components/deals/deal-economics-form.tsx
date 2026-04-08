"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  dealEconomicsSchema,
  type DealEconomicsFormData,
} from "@/lib/schemas/deal-economics";
import { upsertDealEconomics } from "@/lib/actions/deal-economics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  DollarSign,
  TrendingUp,
  Building,
  Percent,
  Wallet,
  Wrench,
} from "lucide-react";

interface DealEconomicsFormProps {
  dealId: string;
  initialData?: Record<string, unknown> | null;
}

interface FieldConfig {
  name: keyof DealEconomicsFormData;
  label: string;
  prefix?: string;
  suffix?: string;
  step?: string;
  isInt?: boolean;
}

export function DealEconomicsForm({
  dealId,
  initialData,
}: DealEconomicsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DealEconomicsFormData>({
    resolver: zodResolver(dealEconomicsSchema) as Resolver<DealEconomicsFormData>,
    defaultValues: {
      deal_id: dealId,
      asking_price: (initialData?.asking_price as number) ?? undefined,
      offer_price: (initialData?.offer_price as number) ?? undefined,
      purchase_price: (initialData?.purchase_price as number) ?? undefined,
      price_per_unit: (initialData?.price_per_unit as number) ?? undefined,
      price_per_sf: (initialData?.price_per_sf as number) ?? undefined,
      noi: (initialData?.noi as number) ?? undefined,
      gross_revenue: (initialData?.gross_revenue as number) ?? undefined,
      occupancy_pct: (initialData?.occupancy_pct as number) ?? undefined,
      cap_rate_in: (initialData?.cap_rate_in as number) ?? undefined,
      cap_rate_out: (initialData?.cap_rate_out as number) ?? undefined,
      loan_amount: (initialData?.loan_amount as number) ?? undefined,
      ltv: (initialData?.ltv as number) ?? undefined,
      interest_rate: (initialData?.interest_rate as number) ?? undefined,
      loan_term_months: (initialData?.loan_term_months as number) ?? undefined,
      lender_id: (initialData?.lender_id as string) ?? undefined,
      irr_target: (initialData?.irr_target as number) ?? undefined,
      equity_multiple: (initialData?.equity_multiple as number) ?? undefined,
      cash_on_cash: (initialData?.cash_on_cash as number) ?? undefined,
      total_equity: (initialData?.total_equity as number) ?? undefined,
      sponsor_equity: (initialData?.sponsor_equity as number) ?? undefined,
      lp_equity: (initialData?.lp_equity as number) ?? undefined,
      closing_costs: (initialData?.closing_costs as number) ?? undefined,
      capex_budget: (initialData?.capex_budget as number) ?? undefined,
      hold_period_months: (initialData?.hold_period_months as number) ?? undefined,
      notes: (initialData?.notes as string) ?? "",
    },
  });

  async function onSubmit(data: DealEconomicsFormData) {
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await upsertDealEconomics(data);
      if (result.error) {
        setMessage(`Error: ${result.error}`);
      } else {
        setMessage("Economics saved successfully.");
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  }

  function renderFieldGroup(
    title: string,
    icon: React.ReactNode,
    fields: FieldConfig[]
  ) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map((field) => (
              <div key={field.name} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  {field.label}
                </label>
                <div className="relative">
                  {field.prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {field.prefix}
                    </span>
                  )}
                  <input
                    type="number"
                    step={field.step ?? "any"}
                    {...register(field.name, { valueAsNumber: true })}
                    className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                      field.prefix ? "pl-7" : ""
                    } ${field.suffix ? "pr-8" : ""}`}
                  />
                  {field.suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {field.suffix}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register("deal_id")} />

      <div className="grid gap-6 lg:grid-cols-2">
        {renderFieldGroup("Purchase", <DollarSign className="h-4 w-4" />, [
          { name: "asking_price", label: "Asking Price", prefix: "$" },
          { name: "offer_price", label: "Offer Price", prefix: "$" },
          { name: "purchase_price", label: "Purchase Price", prefix: "$" },
          { name: "price_per_unit", label: "Price per Unit", prefix: "$" },
          { name: "price_per_sf", label: "Price per SF", prefix: "$" },
        ])}

        {renderFieldGroup("Income", <TrendingUp className="h-4 w-4" />, [
          { name: "noi", label: "NOI", prefix: "$" },
          { name: "gross_revenue", label: "Gross Revenue", prefix: "$" },
          { name: "occupancy_pct", label: "Occupancy", suffix: "%" },
          { name: "cap_rate_in", label: "Going-In Cap Rate" },
          { name: "cap_rate_out", label: "Exit Cap Rate" },
        ])}

        {renderFieldGroup("Financing", <Building className="h-4 w-4" />, [
          { name: "loan_amount", label: "Loan Amount", prefix: "$" },
          { name: "ltv", label: "LTV" },
          { name: "interest_rate", label: "Interest Rate" },
          { name: "loan_term_months", label: "Loan Term (months)", step: "1", isInt: true },
        ])}

        {renderFieldGroup("Returns", <Percent className="h-4 w-4" />, [
          { name: "irr_target", label: "Target IRR" },
          { name: "equity_multiple", label: "Equity Multiple", suffix: "x" },
          { name: "cash_on_cash", label: "Cash-on-Cash" },
        ])}

        {renderFieldGroup("Equity", <Wallet className="h-4 w-4" />, [
          { name: "total_equity", label: "Total Equity", prefix: "$" },
          { name: "sponsor_equity", label: "Sponsor Equity", prefix: "$" },
          { name: "lp_equity", label: "LP Equity", prefix: "$" },
        ])}

        {renderFieldGroup("Costs & Timeline", <Wrench className="h-4 w-4" />, [
          { name: "closing_costs", label: "Closing Costs", prefix: "$" },
          { name: "capex_budget", label: "CapEx Budget", prefix: "$" },
          { name: "hold_period_months", label: "Hold Period (months)", step: "1", isInt: true },
        ])}
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-muted-foreground">
          Notes
        </label>
        <Textarea
          {...register("notes")}
          placeholder="Additional economics notes..."
          rows={3}
        />
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.startsWith("Error")
              ? "text-destructive"
              : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Economics
        </Button>
      </div>
    </form>
  );
}
