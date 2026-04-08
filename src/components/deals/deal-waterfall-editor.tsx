"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Layers,
} from "lucide-react";
import {
  waterfallTierSchema,
  type WaterfallTierFormData,
} from "@/lib/schemas/investor";
import {
  getWaterfallTiers,
  createWaterfallTier,
  updateWaterfallTier,
  deleteWaterfallTier,
} from "@/lib/actions/waterfall";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WaterfallTier {
  id: string;
  deal_id: string;
  tier_order: number;
  tier_label: string;
  hurdle_rate: number | null;
  lp_split_pct: number | null;
  gp_split_pct: number | null;
  is_catch_up: boolean;
  notes: string | null;
}

interface DealWaterfallEditorProps {
  dealId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DealWaterfallEditor({ dealId }: DealWaterfallEditorProps) {
  const router = useRouter();
  const [tiers, setTiers] = useState<WaterfallTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<WaterfallTier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WaterfallTier | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(editingTier);

  const fetchTiers = useCallback(async () => {
    setLoading(true);
    const result = await getWaterfallTiers(dealId);
    setTiers(result.data as unknown as WaterfallTier[]);
    setLoading(false);
  }, [dealId]);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  const form = useForm<WaterfallTierFormData>({
    resolver: zodResolver(waterfallTierSchema) as Resolver<WaterfallTierFormData>,
    defaultValues: {
      deal_id: dealId,
      tier_order: tiers.length + 1,
      tier_label: "",
      hurdle_rate: null,
      lp_split_pct: null,
      gp_split_pct: null,
      is_catch_up: false,
      notes: "",
    },
  });

  function openAddForm() {
    setEditingTier(null);
    form.reset({
      deal_id: dealId,
      tier_order: tiers.length + 1,
      tier_label: "",
      hurdle_rate: null,
      lp_split_pct: null,
      gp_split_pct: null,
      is_catch_up: false,
      notes: "",
    });
    setError(null);
    setFormOpen(true);
  }

  function openEditForm(tier: WaterfallTier) {
    setEditingTier(tier);
    form.reset({
      deal_id: dealId,
      tier_order: tier.tier_order,
      tier_label: tier.tier_label,
      hurdle_rate: tier.hurdle_rate,
      lp_split_pct: tier.lp_split_pct,
      gp_split_pct: tier.gp_split_pct,
      is_catch_up: tier.is_catch_up,
      notes: tier.notes ?? "",
    });
    setError(null);
    setFormOpen(true);
  }

  async function onSubmit(data: WaterfallTierFormData) {
    setSubmitting(true);
    setError(null);
    try {
      const result = isEdit
        ? await updateWaterfallTier(editingTier!.id, data)
        : await createWaterfallTier(data);

      if (result.error) {
        setError(result.error);
      } else {
        setFormOpen(false);
        setEditingTier(null);
        router.refresh();
        fetchTiers();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteWaterfallTier(deleteTarget.id);
    setDeleteTarget(null);
    router.refresh();
    fetchTiers();
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
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {tiers.length} tier{tiers.length !== 1 ? "s" : ""}
        </h3>
        <Button size="sm" onClick={openAddForm}>
          <Plus className="mr-1 h-4 w-4" />
          Add Tier
        </Button>
      </div>

      {tiers.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-5 w-5" />}
          title="No waterfall tiers"
          description="Define the waterfall structure for this deal."
          action={
            <Button size="sm" onClick={openAddForm}>
              <Plus className="mr-1 h-4 w-4" />
              Add Tier
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {tiers.map((tier) => (
            <Card key={tier.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                    {tier.tier_order}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {tier.tier_label}
                      </span>
                      {tier.is_catch_up && (
                        <Badge variant="secondary" className="text-xs">
                          Catch-up
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      {tier.hurdle_rate != null && (
                        <span>Hurdle: {tier.hurdle_rate}%</span>
                      )}
                      {tier.lp_split_pct != null && (
                        <span>LP: {tier.lp_split_pct}%</span>
                      )}
                      {tier.gp_split_pct != null && (
                        <span>GP: {tier.gp_split_pct}%</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditForm(tier)}
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(tier)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Tier Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Tier" : "Add Tier"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the waterfall tier details."
                : "Add a new tier to the waterfall structure."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tier-label">Label *</Label>
                <Input
                  id="tier-label"
                  {...form.register("tier_label")}
                  placeholder="e.g. Preferred Return"
                />
                {form.formState.errors.tier_label && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.tier_label.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tier-order">Order</Label>
                <Input
                  id="tier-order"
                  type="number"
                  {...form.register("tier_order", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tier-hurdle">Hurdle Rate (%)</Label>
              <Input
                id="tier-hurdle"
                type="number"
                step="0.01"
                {...form.register("hurdle_rate", { valueAsNumber: true })}
                placeholder="e.g. 8"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tier-lp">LP Split (%)</Label>
                <Input
                  id="tier-lp"
                  type="number"
                  step="0.01"
                  {...form.register("lp_split_pct", { valueAsNumber: true })}
                  placeholder="e.g. 80"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tier-gp">GP Split (%)</Label>
                <Input
                  id="tier-gp"
                  type="number"
                  step="0.01"
                  {...form.register("gp_split_pct", { valueAsNumber: true })}
                  placeholder="e.g. 20"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                checked={form.watch("is_catch_up")}
                onCheckedChange={(checked) =>
                  form.setValue("is_catch_up", checked as boolean)
                }
              />
              <Label className="text-sm font-normal">
                Catch-up tier
              </Label>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tier-notes">Notes</Label>
              <Textarea
                id="tier-notes"
                {...form.register("notes")}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

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
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? "Update" : "Add"} Tier
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Waterfall Tier"
        description={`Are you sure you want to delete "${deleteTarget?.tier_label}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
