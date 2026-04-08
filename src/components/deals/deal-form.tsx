"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dealSchema, type DealFormData } from "@/lib/schemas/deal";
import { ASSET_CLASSES } from "@/lib/constants/asset-classes";
import { DEAL_STAGES } from "@/lib/constants/deal-stages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { TagInput } from "@/components/shared/tag-input";
import { Separator } from "@/components/ui/separator";
import { Loader2, Search } from "lucide-react";
import { useState, useMemo } from "react";

interface SelectOption {
  id: string;
  label: string;
}

interface DealFormProps {
  initialData?: Partial<DealFormData>;
  onSubmit: (data: DealFormData) => Promise<void>;
  isLoading?: boolean;
  properties?: SelectOption[];
  contacts?: SelectOption[];
}

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: SelectOption[];
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  placeholder: string;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  }, [options, search]);

  const selectedLabel = options.find((o) => o.id === value)?.label;

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        onClick={() => setOpen(!open)}
      >
        <span className={selectedLabel ? "" : "text-muted-foreground"}>
          {selectedLabel ?? placeholder}
        </span>
        <Search className="h-3.5 w-3.5 opacity-50" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
          <div className="p-2">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            <div
              className="relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              onClick={() => {
                onChange(null);
                setOpen(false);
                setSearch("");
              }}
            >
              None
            </div>
            {filtered.map((option) => (
              <div
                key={option.id}
                className={`relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm hover:bg-accent hover:text-accent-foreground ${
                  value === option.id ? "bg-accent text-accent-foreground" : ""
                }`}
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {option.label}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-3 text-center text-sm text-muted-foreground">
                No results found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function DealForm({
  initialData,
  onSubmit,
  isLoading,
  properties = [],
  contacts = [],
}: DealFormProps) {
  const form = useForm<DealFormData>({
    resolver: zodResolver(dealSchema) as Resolver<DealFormData>,
    defaultValues: {
      name: initialData?.name ?? "",
      asset_class: initialData?.asset_class ?? "other",
      stage: initialData?.stage ?? "sourcing",
      property_id: initialData?.property_id ?? null,
      lead_broker_id: initialData?.lead_broker_id ?? null,
      lead_source: initialData?.lead_source ?? "",
      description: initialData?.description ?? "",
      notes: initialData?.notes ?? "",
      tags: initialData?.tags ?? [],
      sourced_at: initialData?.sourced_at ?? "",
      loi_submitted_at: initialData?.loi_submitted_at ?? "",
      loi_accepted_at: initialData?.loi_accepted_at ?? "",
      contract_date: initialData?.contract_date ?? "",
      due_diligence_start: initialData?.due_diligence_start ?? "",
      due_diligence_end: initialData?.due_diligence_end ?? "",
      closing_date: initialData?.closing_date ?? "",
      dead_at: initialData?.dead_at ?? "",
      dead_reason: initialData?.dead_reason ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Deal Info */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Deal Info
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deal Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Sunrise Portfolio Acquisition" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="asset_class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Class *</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset class" />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSET_CLASSES.map((ac) => (
                          <SelectItem key={ac.value} value={ac.value}>
                            {ac.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ?? "sourcing"}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEAL_STAGES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="property_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      options={properties}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select property..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lead_broker_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Broker</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      options={contacts}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select broker..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lead_source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Source</FormLabel>
                  <FormControl>
                    <Input placeholder="CoStar, Referral, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the deal..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Key Dates */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Key Dates
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="sourced_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sourced Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="loi_submitted_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LOI Submitted</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="loi_accepted_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LOI Accepted</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contract_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="due_diligence_start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DD Start</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="due_diligence_end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DD End</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="closing_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Closing Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dead_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dead Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dead_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dead Reason</FormLabel>
                  <FormControl>
                    <Input placeholder="Pricing, competition, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Additional */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Additional
          </h3>
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagInput
                      value={field.value ?? []}
                      onChange={field.onChange}
                      placeholder="Add tags..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this deal..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {initialData ? "Update Deal" : "Create Deal"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
