"use client";

import { useState, useEffect, useCallback } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Building2,
  DollarSign,
  Percent,
} from "lucide-react";
import { getTenants, deleteTenant } from "@/lib/actions/tenants";
import { getLeases } from "@/lib/actions/leases";
import {
  TENANT_STATUS_MAP,
  type TenantStatus,
} from "@/lib/constants/tenant-statuses";
import {
  LEASE_TYPE_MAP,
  type LeaseType,
} from "@/lib/constants/lease-types";
import { cn, formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, SortableHeader } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TenantForm } from "./tenant-form";
import { LeaseForm } from "./lease-form";

interface TenantRow {
  id: string;
  name: string;
  unit_label?: string | null;
  status: string;
  occupied_sf?: number | null;
  notes?: string | null;
  leases?: Array<{
    id: string;
    start_date: string;
    end_date?: string | null;
    monthly_rent?: number | null;
    status?: string | null;
  }>;
}

interface LeaseRow {
  id: string;
  tenant_id: string;
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

interface RentRollTabProps {
  propertyId: string;
  propertyTotalSf?: number | null;
}

function getLeaseStatus(
  lease?: { end_date?: string | null; status?: string | null } | null
): { label: string; color: string } {
  if (!lease) return { label: "No Lease", color: "bg-slate-100 text-slate-700" };
  if (!lease.end_date)
    return { label: "Active", color: "bg-green-100 text-green-700" };

  const endDate = new Date(lease.end_date);
  const now = new Date();
  const daysUntilEnd = Math.ceil(
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilEnd < 0) return { label: "Expired", color: "bg-red-100 text-red-700" };
  if (daysUntilEnd < 90)
    return {
      label: "Expiring Soon",
      color: "bg-amber-100 text-amber-700",
    };
  return { label: "Active", color: "bg-green-100 text-green-700" };
}

export function RentRollTab({
  propertyId,
  propertyTotalSf,
}: RentRollTabProps) {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantFormOpen, setTenantFormOpen] = useState(false);
  const [leaseFormOpen, setLeaseFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantRow | null>(null);
  const [editingLease, setEditingLease] = useState<LeaseRow | null>(null);
  const [leaseFormTenantId, setLeaseFormTenantId] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<TenantRow | null>(null);
  const [expandedTenantId, setExpandedTenantId] = useState<string | null>(null);
  const [tenantLeases, setTenantLeases] = useState<LeaseRow[]>([]);

  const loadTenants = useCallback(async () => {
    setLoading(true);
    const result = await getTenants(propertyId);
    setTenants((result.data ?? []) as TenantRow[]);
    setLoading(false);
  }, [propertyId]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  async function handleExpandTenant(tenantId: string) {
    if (expandedTenantId === tenantId) {
      setExpandedTenantId(null);
      setTenantLeases([]);
      return;
    }
    setExpandedTenantId(tenantId);
    const result = await getLeases({ tenantId });
    setTenantLeases((result.data ?? []) as LeaseRow[]);
  }

  async function handleDeleteTenant() {
    if (!deleteTarget) return;
    await deleteTenant(deleteTarget.id);
    setDeleteTarget(null);
    loadTenants();
  }

  // Compute summary stats
  const totalTenants = tenants.length;
  const occupiedSf = tenants.reduce(
    (sum, t) => sum + (t.occupied_sf ?? 0),
    0
  );
  const occupancyRate =
    propertyTotalSf && propertyTotalSf > 0
      ? (occupiedSf / propertyTotalSf) * 100
      : null;

  // Sum monthly rents from latest leases
  const monthlyRent = tenants.reduce((sum, t) => {
    const latestLease = t.leases?.[0];
    return sum + (latestLease?.monthly_rent ?? 0);
  }, 0);

  const columns: ColumnDef<TenantRow, unknown>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader column={column}>Tenant Name</SortableHeader>
      ),
      cell: ({ row }) => (
        <button
          type="button"
          className="text-sm font-medium text-primary hover:underline text-left"
          onClick={() => handleExpandTenant(row.original.id)}
        >
          {row.original.name}
        </button>
      ),
    },
    {
      accessorKey: "unit_label",
      header: "Unit",
      cell: ({ getValue }) => (
        <span className="text-sm">{(getValue() as string) || "---"}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as TenantStatus;
        const s = TENANT_STATUS_MAP[status];
        return s ? (
          <Badge className={s.color}>{s.label}</Badge>
        ) : (
          <span className="text-sm">{status}</span>
        );
      },
    },
    {
      accessorKey: "occupied_sf",
      header: ({ column }) => (
        <SortableHeader column={column}>Occupied SF</SortableHeader>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm">
          {formatNumber(getValue() as number | null)}
        </span>
      ),
    },
    {
      id: "monthly_rent",
      header: ({ column }) => (
        <SortableHeader column={column}>Monthly Rent</SortableHeader>
      ),
      accessorFn: (row) => row.leases?.[0]?.monthly_rent ?? null,
      cell: ({ getValue }) => (
        <span className="text-sm">
          {formatCurrency(getValue() as number | null)}
        </span>
      ),
    },
    {
      id: "lease_end",
      header: "Lease End",
      accessorFn: (row) => row.leases?.[0]?.end_date ?? null,
      cell: ({ getValue }) => (
        <span className="text-sm">
          {formatDate(getValue() as string | null)}
        </span>
      ),
    },
    {
      id: "lease_status",
      header: "Lease Status",
      cell: ({ row }) => {
        const latestLease = row.original.leases?.[0];
        const status = getLeaseStatus(latestLease);
        return <Badge className={status.color}>{status.label}</Badge>;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditingTenant(row.original);
              setTenantFormOpen(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setLeaseFormTenantId(row.original.id);
              setEditingLease(null);
              setLeaseFormOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row.original);
            }}
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
        Loading rent roll...
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tenants</p>
                <p className="text-2xl font-bold">{totalTenants}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Occupied SF</p>
                <p className="text-2xl font-bold">{formatNumber(occupiedSf)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Percent className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                <p className="text-2xl font-bold">
                  {occupancyRate != null ? `${occupancyRate.toFixed(1)}%` : "---"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Rent</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(monthlyRent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Tenants</h3>
          <Button
            size="sm"
            onClick={() => {
              setEditingTenant(null);
              setTenantFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Tenant
          </Button>
        </div>

        {tenants.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="No tenants"
            description="Add your first tenant to start building the rent roll."
            action={
              <Button
                size="sm"
                onClick={() => {
                  setEditingTenant(null);
                  setTenantFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Tenant
              </Button>
            }
          />
        ) : (
          <>
            <DataTable columns={columns} data={tenants} />

            {/* Expanded lease details */}
            {expandedTenantId && (
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold">
                      Leases for{" "}
                      {tenants.find((t) => t.id === expandedTenantId)?.name}
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setLeaseFormTenantId(expandedTenantId);
                        setEditingLease(null);
                        setLeaseFormOpen(true);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Lease
                    </Button>
                  </div>
                  {tenantLeases.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No leases found for this tenant.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="text-left py-2 px-3 font-medium">
                              Type
                            </th>
                            <th className="text-left py-2 px-3 font-medium">
                              Start
                            </th>
                            <th className="text-left py-2 px-3 font-medium">
                              End
                            </th>
                            <th className="text-left py-2 px-3 font-medium">
                              Rent
                            </th>
                            <th className="text-left py-2 px-3 font-medium">
                              CAM
                            </th>
                            <th className="text-left py-2 px-3 font-medium">
                              Status
                            </th>
                            <th className="text-right py-2 px-3 font-medium">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {tenantLeases.map((lease) => {
                            const lt =
                              LEASE_TYPE_MAP[
                                lease.lease_type as LeaseType
                              ];
                            const leaseStatus = getLeaseStatus(lease);
                            return (
                              <tr key={lease.id} className="border-b">
                                <td className="py-2 px-3">
                                  {lt ? (
                                    <Badge className={lt.color}>
                                      {lt.label}
                                    </Badge>
                                  ) : (
                                    lease.lease_type
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  {formatDate(lease.start_date)}
                                </td>
                                <td className="py-2 px-3">
                                  {formatDate(lease.end_date)}
                                </td>
                                <td className="py-2 px-3">
                                  {formatCurrency(lease.rent_amount)}
                                </td>
                                <td className="py-2 px-3">
                                  {formatCurrency(lease.cam_charges)}
                                </td>
                                <td className="py-2 px-3">
                                  <Badge className={leaseStatus.color}>
                                    {leaseStatus.label}
                                  </Badge>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setLeaseFormTenantId(
                                        expandedTenantId
                                      );
                                      setEditingLease(lease);
                                      setLeaseFormOpen(true);
                                    }}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <TenantForm
        propertyId={propertyId}
        tenant={editingTenant}
        open={tenantFormOpen}
        onOpenChange={(open) => {
          setTenantFormOpen(open);
          if (!open) setEditingTenant(null);
        }}
        onSuccess={loadTenants}
      />

      <LeaseForm
        tenantId={leaseFormTenantId}
        propertyId={propertyId}
        lease={editingLease}
        open={leaseFormOpen}
        onOpenChange={(open) => {
          setLeaseFormOpen(open);
          if (!open) {
            setEditingLease(null);
            setLeaseFormTenantId("");
          }
        }}
        onSuccess={() => {
          loadTenants();
          if (expandedTenantId) {
            handleExpandTenant(expandedTenantId);
            // Re-fetch by setting null first then expanding again
            setExpandedTenantId(null);
            setTimeout(() => handleExpandTenant(expandedTenantId), 100);
          }
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Tenant"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This will also remove all associated leases.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteTenant}
      />
    </div>
  );
}
