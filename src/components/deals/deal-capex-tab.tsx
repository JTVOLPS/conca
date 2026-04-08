"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, Pencil, Trash2, HardHat } from "lucide-react";
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
import { CAPEX_STATUSES, CAPEX_STATUS_MAP } from "@/lib/constants/capex-statuses";
import {
  getCapexProjects,
  createCapexProject,
  deleteCapexProject,
} from "@/lib/actions/capex-projects";
import { getProperties } from "@/lib/actions/properties";
import {
  capexProjectSchema,
  type CapexProjectFormData,
} from "@/lib/schemas/capex-project";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CapexRow {
  id: string;
  name: string;
  status: string;
  budget_amount: number | null;
  spent_amount: number | null;
  target_completion_date: string | null;
  property_id: string;
  properties?: { id: string; name: string } | null;
}

interface PropertyOption {
  id: string;
  name: string;
}

interface DealCapexTabProps {
  dealId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DealCapexTab({ dealId }: DealCapexTabProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<CapexRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const result = await getCapexProjects({ dealId });
    if (result.error) {
      setError(result.error);
    } else {
      setProjects(result.data as CapexRow[]);
    }
    setLoading(false);
  }, [dealId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const form = useForm<CapexProjectFormData>({
    resolver: zodResolver(capexProjectSchema),
    defaultValues: {
      deal_id: dealId,
      property_id: "",
      name: "",
      status: "planned",
      budget_amount: null,
      spent_amount: null,
      target_completion_date: "",
      description: "",
      notes: "",
      contractor: "",
    },
  });

  async function openForm() {
    form.reset({
      deal_id: dealId,
      property_id: "",
      name: "",
      status: "planned",
      budget_amount: null,
      spent_amount: null,
      target_completion_date: "",
      description: "",
      notes: "",
      contractor: "",
    });
    // Fetch properties for the selector
    const propResult = await getProperties({ pageSize: 100 });
    if (propResult.data) {
      setProperties(
        propResult.data.map((p: { id: string; name: string }) => ({
          id: p.id,
          name: p.name,
        }))
      );
    }
    setFormOpen(true);
  }

  async function onSubmit(data: CapexProjectFormData) {
    setSubmitting(true);
    const result = await createCapexProject({ ...data, deal_id: dealId });
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setFormOpen(false);
    router.refresh();
    fetchProjects();
  }

  async function handleDelete() {
    if (!deleteId) return;
    await deleteCapexProject(deleteId);
    setDeleteId(null);
    router.refresh();
    fetchProjects();
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
          {projects.length} project{projects.length !== 1 ? "s" : ""}
        </h3>
        <Button size="sm" onClick={openForm}>
          <Plus className="mr-1 h-4 w-4" />
          Add Project
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {projects.length === 0 ? (
        <EmptyState
          icon={<HardHat className="h-5 w-5" />}
          title="No CapEx projects"
          description="Add a capital expenditure project to this deal."
          action={
            <Button size="sm" onClick={openForm}>
              <Plus className="mr-1 h-4 w-4" />
              Add Project
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
                    <th className="px-4 py-3 text-left font-medium">Project Name</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Budget</th>
                    <th className="px-4 py-3 text-right font-medium">Spent</th>
                    <th className="px-4 py-3 text-left font-medium">Target Date</th>
                    <th className="px-4 py-3 text-left font-medium">Property</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => {
                    const status =
                      CAPEX_STATUS_MAP[
                        project.status as keyof typeof CAPEX_STATUS_MAP
                      ];
                    return (
                      <tr key={project.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-medium">
                          {project.name}
                        </td>
                        <td className="px-4 py-3">
                          {status ? (
                            <span
                              className={cn(
                                "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                                status.color
                              )}
                            >
                              {status.label}
                            </span>
                          ) : (
                            <Badge variant="secondary">{project.status}</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(project.budget_amount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(project.spent_amount)}
                        </td>
                        <td className="px-4 py-3">
                          {formatDate(project.target_completion_date)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {project.properties?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(
                                  `/properties/${project.property_id}`
                                )
                              }
                              title="Edit at property"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(project.id)}
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

      {/* Add Project Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add CapEx Project</DialogTitle>
            <DialogDescription>
              Create a new capital expenditure project for this deal.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="capex-property">Property *</Label>
              <Select
                value={form.watch("property_id")}
                onValueChange={(val) => form.setValue("property_id", val)}
              >
                <SelectTrigger id="capex-property">
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((prop) => (
                    <SelectItem key={prop.id} value={prop.id}>
                      {prop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.property_id && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.property_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capex-name">Project Name *</Label>
              <Input
                id="capex-name"
                {...form.register("name")}
                placeholder="e.g. Roof Replacement"
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="capex-status">Status</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(val) =>
                    form.setValue("status", val as CapexProjectFormData["status"])
                  }
                >
                  <SelectTrigger id="capex-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAPEX_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capex-target">Target Completion</Label>
                <Input
                  id="capex-target"
                  type="date"
                  {...form.register("target_completion_date")}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="capex-budget">Budget</Label>
                <Input
                  id="capex-budget"
                  type="number"
                  step="0.01"
                  {...form.register("budget_amount")}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capex-contractor">Contractor</Label>
                <Input
                  id="capex-contractor"
                  {...form.register("contractor")}
                  placeholder="Contractor name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capex-description">Description</Label>
              <Textarea
                id="capex-description"
                {...form.register("description")}
                placeholder="Project description..."
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
                {submitting ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Project"
        description="Are you sure you want to delete this CapEx project? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
