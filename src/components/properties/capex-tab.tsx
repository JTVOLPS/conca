"use client";

import { useState, useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Pencil,
  Trash2,
  DollarSign,
  Hammer,
  Target,
} from "lucide-react";
import {
  getCapexProjects,
  deleteCapexProject,
} from "@/lib/actions/capex-projects";
import {
  CAPEX_STATUS_MAP,
  type CapexStatus,
} from "@/lib/constants/capex-statuses";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, SortableHeader } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CapexProjectForm } from "./capex-project-form";

interface CapexRow {
  id: string;
  name: string;
  status: string;
  budget_amount: number | null;
  spent_amount: number | null;
  start_date?: string | null;
  target_completion_date?: string | null;
  actual_completion_date?: string | null;
  contractor?: string | null;
  description?: string | null;
  notes?: string | null;
}

interface CapexTabProps {
  propertyId: string;
}

export function CapexTab({ propertyId }: CapexTabProps) {
  const [projects, setProjects] = useState<CapexRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<CapexRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CapexRow | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let stale = false;
    (async () => {
      const result = await getCapexProjects({ propertyId });
      if (!stale) {
        setProjects((result.data ?? []) as CapexRow[]);
        setLoading(false);
      }
    })();
    return () => { stale = true; };
  }, [propertyId, refreshKey]);

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteCapexProject(deleteTarget.id);
    setDeleteTarget(null);
    setRefreshKey((k) => k + 1);
  }

  // Summary stats
  const totalBudget = projects.reduce(
    (s, p) => s + (p.budget_amount ?? 0),
    0
  );
  const totalSpent = projects.reduce(
    (s, p) => s + (p.spent_amount ?? 0),
    0
  );
  const activeProjects = projects.filter(
    (p) => p.status === "planned" || p.status === "in_progress"
  ).length;

  const columns: ColumnDef<CapexRow, unknown>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader column={column}>Project Name</SortableHeader>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm font-medium">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as CapexStatus;
        const s = CAPEX_STATUS_MAP[status];
        return s ? (
          <Badge className={s.color}>{s.label}</Badge>
        ) : (
          <span className="text-sm">{status}</span>
        );
      },
    },
    {
      accessorKey: "budget_amount",
      header: ({ column }) => (
        <SortableHeader column={column}>Budget</SortableHeader>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm">
          {formatCurrency(getValue() as number | null)}
        </span>
      ),
    },
    {
      accessorKey: "spent_amount",
      header: ({ column }) => (
        <SortableHeader column={column}>Spent</SortableHeader>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm">
          {formatCurrency(getValue() as number | null)}
        </span>
      ),
    },
    {
      id: "pct_used",
      header: "% Used",
      cell: ({ row }) => {
        const budget = row.original.budget_amount ?? 0;
        const spent = row.original.spent_amount ?? 0;
        if (budget === 0) return <span className="text-sm text-muted-foreground">---</span>;
        const pct = Math.min((spent / budget) * 100, 100);
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  pct > 90
                    ? "bg-red-500"
                    : pct > 70
                      ? "bg-amber-500"
                      : "bg-green-500"
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {pct.toFixed(0)}%
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "target_completion_date",
      header: "Target Date",
      cell: ({ getValue }) => (
        <span className="text-sm">
          {formatDate(getValue() as string | null)}
        </span>
      ),
    },
    {
      accessorKey: "contractor",
      header: "Contractor",
      cell: ({ getValue }) => (
        <span className="text-sm">
          {(getValue() as string) || "---"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingProject(row.original);
              setFormOpen(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading CapEx projects...
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalBudget)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Hammer className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Projects
                </p>
                <p className="text-2xl font-bold">{activeProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Projects</h3>
          <Button
            size="sm"
            onClick={() => {
              setEditingProject(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={<Hammer className="h-6 w-6" />}
            title="No CapEx projects"
            description="Add your first capital expenditure project."
            action={
              <Button
                size="sm"
                onClick={() => {
                  setEditingProject(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Project
              </Button>
            }
          />
        ) : (
          <DataTable columns={columns} data={projects} />
        )}
      </div>

      {/* Dialogs */}
      <CapexProjectForm
        propertyId={propertyId}
        project={editingProject}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingProject(null);
        }}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete CapEx Project"
        description={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
