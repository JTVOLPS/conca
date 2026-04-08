"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  capexProjectSchema,
  type CapexProjectFormData,
} from "@/lib/schemas/capex-project";
import {
  createCapexProject,
  updateCapexProject,
} from "@/lib/actions/capex-projects";
import { CAPEX_STATUSES } from "@/lib/constants/capex-statuses";
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

interface CapexProjectData {
  id: string;
  name: string;
  status?: string | null;
  budget_amount?: number | null;
  spent_amount?: number | null;
  start_date?: string | null;
  target_completion_date?: string | null;
  actual_completion_date?: string | null;
  contractor?: string | null;
  description?: string | null;
  notes?: string | null;
}

interface CapexProjectFormProps {
  propertyId: string;
  project?: CapexProjectData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CapexProjectForm({
  propertyId,
  project,
  open,
  onOpenChange,
  onSuccess,
}: CapexProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(project?.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CapexProjectFormData>({
    resolver: zodResolver(capexProjectSchema) as Resolver<CapexProjectFormData>,
    defaultValues: {
      property_id: propertyId,
      name: project?.name ?? "",
      status:
        (project?.status as CapexProjectFormData["status"]) ?? "planned",
      budget_amount: project?.budget_amount ?? null,
      spent_amount: project?.spent_amount ?? null,
      start_date: project?.start_date ?? "",
      target_completion_date: project?.target_completion_date ?? "",
      actual_completion_date: project?.actual_completion_date ?? "",
      contractor: project?.contractor ?? "",
      description: project?.description ?? "",
      notes: project?.notes ?? "",
    },
  });

  const statusValue = watch("status") ?? "planned";

  async function onSubmit(data: CapexProjectFormData) {
    setIsLoading(true);
    setError(null);
    try {
      const result = isEdit
        ? await updateCapexProject(project!.id, data)
        : await createCapexProject(data);

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
            {isEdit ? "Edit CapEx Project" : "Add CapEx Project"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update project details."
              : "Add a new capital expenditure project."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("property_id")} />

          <div className="space-y-1.5">
            <Label htmlFor="capex-name">Project Name *</Label>
            <Input
              id="capex-name"
              {...register("name")}
              placeholder="Project name"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={statusValue}
              onValueChange={(v) =>
                setValue("status", v as CapexProjectFormData["status"])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
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

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="capex-budget">Budget Amount ($)</Label>
                  <Input
                    id="capex-budget"
                    type="number"
                    step="0.01"
                    {...register("budget_amount", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="capex-spent">Spent Amount ($)</Label>
                  <Input
                    id="capex-spent"
                    type="number"
                    step="0.01"
                    {...register("spent_amount", { valueAsNumber: true })}
                    placeholder="0.00"
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
                  <Label htmlFor="capex-start">Start Date</Label>
                  <Input
                    id="capex-start"
                    type="date"
                    {...register("start_date")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="capex-target">Target Completion</Label>
                  <Input
                    id="capex-target"
                    type="date"
                    {...register("target_completion_date")}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="capex-actual">Actual Completion</Label>
                <Input
                  id="capex-actual"
                  type="date"
                  {...register("actual_completion_date")}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-1.5">
            <Label htmlFor="capex-contractor">Contractor</Label>
            <Input
              id="capex-contractor"
              {...register("contractor")}
              placeholder="Contractor name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="capex-desc">Description</Label>
            <Textarea
              id="capex-desc"
              {...register("description")}
              placeholder="Project description..."
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="capex-notes">Notes</Label>
            <Textarea
              id="capex-notes"
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
              {isEdit ? "Update" : "Add"} Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
