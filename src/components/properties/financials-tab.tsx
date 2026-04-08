"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  getOperatingSummary,
  getOperatingStatements,
  deleteOperatingStatement,
  upsertOperatingStatement,
} from "@/lib/actions/operating-statements";
import {
  OPERATING_CATEGORY_LABELS,
} from "@/lib/constants/operating-categories";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { OperatingStatementForm } from "./operating-statement-form";

interface MonthlySummary {
  month: number;
  revenue_actual: number;
  revenue_budget: number;
  expense_actual: number;
  expense_budget: number;
  noi_actual: number;
  noi_budget: number;
}

interface StatementRow {
  id: string;
  property_id: string;
  period_year: number;
  period_month: number;
  category: string;
  line_item: string;
  actual_amount: number | null;
  budget_amount: number | null;
  notes?: string | null;
}

interface FinancialsTabProps {
  propertyId: string;
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function FinancialsTab({ propertyId }: FinancialsTabProps) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;

  const [year, setYear] = useState(currentDate.getFullYear());
  const [summary, setSummary] = useState<MonthlySummary[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [monthlyStatements, setMonthlyStatements] = useState<StatementRow[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [monthLoading, setMonthLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStatement, setEditingStatement] =
    useState<StatementRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StatementRow | null>(null);
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: "actual_amount" | "budget_amount";
  } | null>(null);
  const [editingCellValue, setEditingCellValue] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let stale = false;
    (async () => {
      const result = await getOperatingSummary(propertyId, year);
      if (!stale) {
        setSummary((result.data ?? []) as MonthlySummary[]);
        setLoading(false);
      }
    })();
    return () => { stale = true; };
  }, [propertyId, year, refreshKey]);

  useEffect(() => {
    let stale = false;
    (async () => {
      setMonthLoading(true);
      const result = await getOperatingStatements(
        propertyId,
        year,
        selectedMonth
      );
      if (!stale) {
        setMonthlyStatements((result.data ?? []) as StatementRow[]);
        setMonthLoading(false);
      }
    })();
    return () => { stale = true; };
  }, [propertyId, year, selectedMonth, refreshKey]);

  async function handleDeleteStatement() {
    if (!deleteTarget) return;
    await deleteOperatingStatement(deleteTarget.id);
    setDeleteTarget(null);
    setRefreshKey((k) => k + 1);
  }

  async function handleInlineEdit(row: StatementRow) {
    if (!editingCell) return;
    const newValue = editingCellValue.trim() === "" ? null : Number(editingCellValue);
    if (newValue === (row[editingCell.field] ?? null)) {
      setEditingCell(null);
      return;
    }

    await upsertOperatingStatement({
      property_id: row.property_id,
      period_year: row.period_year,
      period_month: row.period_month,
      category: row.category as "revenue" | "operating_expense" | "capital_expense",
      line_item: row.line_item,
      actual_amount:
        editingCell.field === "actual_amount"
          ? newValue
          : row.actual_amount,
      budget_amount:
        editingCell.field === "budget_amount"
          ? newValue
          : row.budget_amount,
      notes: row.notes ?? "",
    });

    setEditingCell(null);
    setRefreshKey((k) => k + 1);
  }

  // Group monthly statements by category
  const groupedStatements = monthlyStatements.reduce<
    Record<string, StatementRow[]>
  >((acc, row) => {
    const cat = row.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(row);
    return acc;
  }, {});

  // Build full 12-month grid
  const summaryByMonth = new Map(summary.map((s) => [s.month, s]));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading financials...
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {/* Year selector */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setYear((y) => y - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">{year}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setYear((y) => y + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Annual Summary Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Annual Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.length === 0 ? (
            <EmptyState
              title="No data"
              description={`No operating statements found for ${year}. Add line items to get started.`}
              className="border-0 p-4"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground w-24">
                      Month
                    </th>
                    <th
                      className="text-right py-2 px-2 font-medium text-muted-foreground"
                      colSpan={2}
                    >
                      Revenue
                    </th>
                    <th
                      className="text-right py-2 px-2 font-medium text-muted-foreground"
                      colSpan={2}
                    >
                      Expenses
                    </th>
                    <th
                      className="text-right py-2 px-2 font-medium text-muted-foreground"
                      colSpan={2}
                    >
                      NOI
                    </th>
                  </tr>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th />
                    <th className="text-right py-1 px-2">Actual</th>
                    <th className="text-right py-1 px-2">Budget</th>
                    <th className="text-right py-1 px-2">Actual</th>
                    <th className="text-right py-1 px-2">Budget</th>
                    <th className="text-right py-1 px-2">Actual</th>
                    <th className="text-right py-1 px-2">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(
                    (month) => {
                      const data = summaryByMonth.get(month);
                      const isCurrentMonth =
                        year === currentDate.getFullYear() &&
                        month === currentMonth;
                      const isSelected = month === selectedMonth;
                      return (
                        <tr
                          key={month}
                          className={cn(
                            "border-b cursor-pointer hover:bg-muted/50 transition-colors",
                            isCurrentMonth && "bg-blue-50/50",
                            isSelected && "bg-accent"
                          )}
                          onClick={() => setSelectedMonth(month)}
                        >
                          <td className="py-2 px-2 font-medium">
                            {MONTH_LABELS[month - 1]}
                          </td>
                          <td className="text-right py-2 px-2">
                            {data
                              ? formatCurrency(data.revenue_actual)
                              : "---"}
                          </td>
                          <td className="text-right py-2 px-2 text-muted-foreground">
                            {data
                              ? formatCurrency(data.revenue_budget)
                              : "---"}
                          </td>
                          <td className="text-right py-2 px-2">
                            {data
                              ? formatCurrency(data.expense_actual)
                              : "---"}
                          </td>
                          <td className="text-right py-2 px-2 text-muted-foreground">
                            {data
                              ? formatCurrency(data.expense_budget)
                              : "---"}
                          </td>
                          <td
                            className={cn(
                              "text-right py-2 px-2 font-medium",
                              data && data.noi_actual < 0
                                ? "text-destructive"
                                : ""
                            )}
                          >
                            {data ? formatCurrency(data.noi_actual) : "---"}
                          </td>
                          <td className="text-right py-2 px-2 text-muted-foreground">
                            {data ? formatCurrency(data.noi_budget) : "---"}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Detail */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {MONTH_LABELS[selectedMonth - 1]} {year} Detail
            </CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setEditingStatement(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Line Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {monthLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading...
            </div>
          ) : monthlyStatements.length === 0 ? (
            <EmptyState
              title="No line items"
              description={`No entries for ${MONTH_LABELS[selectedMonth - 1]} ${year}.`}
              className="border-0 p-4"
              action={
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingStatement(null);
                    setFormOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Line Item
                </Button>
              }
            />
          ) : (
            <div className="space-y-6">
              {(
                ["revenue", "operating_expense", "capital_expense"] as const
              ).map((category) => {
                const rows = groupedStatements[category];
                if (!rows || rows.length === 0) return null;

                const categoryLabel =
                  OPERATING_CATEGORY_LABELS[category] ?? category;

                const totalActual = rows.reduce(
                  (s, r) => s + (r.actual_amount ?? 0),
                  0
                );
                const totalBudget = rows.reduce(
                  (s, r) => s + (r.budget_amount ?? 0),
                  0
                );
                const totalVariance = totalActual - totalBudget;

                return (
                  <div key={category}>
                    <h4 className="text-sm font-semibold mb-2">
                      {categoryLabel}
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="text-left py-2 px-3 font-medium">
                              Line Item
                            </th>
                            <th className="text-right py-2 px-3 font-medium">
                              Actual
                            </th>
                            <th className="text-right py-2 px-3 font-medium">
                              Budget
                            </th>
                            <th className="text-right py-2 px-3 font-medium">
                              Variance
                            </th>
                            <th className="text-right py-2 px-3 font-medium w-20">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row) => {
                            const variance =
                              (row.actual_amount ?? 0) -
                              (row.budget_amount ?? 0);
                            return (
                              <tr key={row.id} className="border-b">
                                <td className="py-2 px-3">{row.line_item}</td>
                                <td className="text-right py-2 px-3">
                                  {editingCell?.id === row.id &&
                                  editingCell.field === "actual_amount" ? (
                                    <input
                                      type="number"
                                      step="0.01"
                                      className="w-24 text-right rounded border border-input bg-transparent px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                      value={editingCellValue}
                                      onChange={(e) =>
                                        setEditingCellValue(e.target.value)
                                      }
                                      onBlur={() => handleInlineEdit(row)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                          handleInlineEdit(row);
                                        if (e.key === "Escape")
                                          setEditingCell(null);
                                      }}
                                      autoFocus
                                    />
                                  ) : (
                                    <button
                                      type="button"
                                      className="hover:underline cursor-pointer"
                                      onClick={() => {
                                        setEditingCell({
                                          id: row.id,
                                          field: "actual_amount",
                                        });
                                        setEditingCellValue(
                                          row.actual_amount?.toString() ?? ""
                                        );
                                      }}
                                    >
                                      {formatCurrency(row.actual_amount)}
                                    </button>
                                  )}
                                </td>
                                <td className="text-right py-2 px-3">
                                  {editingCell?.id === row.id &&
                                  editingCell.field === "budget_amount" ? (
                                    <input
                                      type="number"
                                      step="0.01"
                                      className="w-24 text-right rounded border border-input bg-transparent px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                      value={editingCellValue}
                                      onChange={(e) =>
                                        setEditingCellValue(e.target.value)
                                      }
                                      onBlur={() => handleInlineEdit(row)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                          handleInlineEdit(row);
                                        if (e.key === "Escape")
                                          setEditingCell(null);
                                      }}
                                      autoFocus
                                    />
                                  ) : (
                                    <button
                                      type="button"
                                      className="hover:underline cursor-pointer text-muted-foreground"
                                      onClick={() => {
                                        setEditingCell({
                                          id: row.id,
                                          field: "budget_amount",
                                        });
                                        setEditingCellValue(
                                          row.budget_amount?.toString() ?? ""
                                        );
                                      }}
                                    >
                                      {formatCurrency(row.budget_amount)}
                                    </button>
                                  )}
                                </td>
                                <td
                                  className={cn(
                                    "text-right py-2 px-3",
                                    variance < 0
                                      ? "text-destructive"
                                      : variance > 0
                                        ? "text-green-600"
                                        : ""
                                  )}
                                >
                                  {formatCurrency(variance)}
                                </td>
                                <td className="text-right py-2 px-3">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEditingStatement(row);
                                        setFormOpen(true);
                                      }}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setDeleteTarget(row)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t font-medium">
                            <td className="py-2 px-3">Total</td>
                            <td className="text-right py-2 px-3">
                              {formatCurrency(totalActual)}
                            </td>
                            <td className="text-right py-2 px-3 text-muted-foreground">
                              {formatCurrency(totalBudget)}
                            </td>
                            <td
                              className={cn(
                                "text-right py-2 px-3",
                                totalVariance < 0
                                  ? "text-destructive"
                                  : totalVariance > 0
                                    ? "text-green-600"
                                    : ""
                              )}
                            >
                              {formatCurrency(totalVariance)}
                            </td>
                            <td />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <OperatingStatementForm
        propertyId={propertyId}
        year={year}
        month={selectedMonth}
        statement={editingStatement}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingStatement(null);
        }}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Line Item"
        description={`Are you sure you want to delete "${deleteTarget?.line_item}"?`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteStatement}
      />
    </div>
  );
}
