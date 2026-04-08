import Link from "next/link";
import {
  Handshake,
  MapPin,
  Users,
  AlertTriangle,
  Calendar,
  CheckSquare,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { getExpiringLeases } from "@/lib/actions/leases";
import { getDebtMaturitySchedule } from "@/lib/actions/debt-instruments";
import { getPortfolioKPIs, getPipelineByStage, getDebtMaturityLadder } from "@/lib/actions/portfolio";
import { getMyTasks, getOverdueTasks } from "@/lib/actions/tasks";
import { PortfolioKpiCards } from "@/components/dashboard/portfolio-kpi-cards";
import { PipelineSummary } from "@/components/dashboard/pipeline-summary";
import { DebtMaturityCard } from "@/components/dashboard/debt-maturity-card";
import { MyTasksCard } from "@/components/dashboard/my-tasks-card";

async function getDashboardStats() {
  const supabase = await createClient();

  const [dealsResult, propertiesResult, contactsResult] =
    await Promise.all([
      supabase
        .from("deals")
        .select("id", { count: "exact", head: true })
        .not("stage", "in", '("closed","dead")'),
      supabase
        .from("properties")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("contacts")
        .select("id", { count: "exact", head: true }),
    ]);

  return {
    activeDeals: dealsResult.count ?? 0,
    propertiesOwned: propertiesResult.count ?? 0,
    totalContacts: contactsResult.count ?? 0,
  };
}

export default async function DashboardPage() {
  const [
    stats,
    expiringLeasesResult,
    debtMaturityResult,
    kpis,
    pipelineResult,
    debtLadderResult,
    myTasksResult,
    overdueTasksResult,
  ] = await Promise.all([
    getDashboardStats(),
    getExpiringLeases(90),
    getDebtMaturitySchedule(),
    getPortfolioKPIs(),
    getPipelineByStage(),
    getDebtMaturityLadder(),
    getMyTasks(5),
    getOverdueTasks(),
  ]);

  const expiringLeases = expiringLeasesResult.data ?? [];
  const overdueTasks = overdueTasksResult.data ?? [];
  const myTasks = myTasksResult.data ?? [];
  const pipelineStages = pipelineResult.data ?? [];
  const debtMaturities = debtLadderResult.data ?? [];

  // Filter debt maturities to within 12 months for alert banner
  const now = new Date();
  const twelveMonthsOut = new Date();
  twelveMonthsOut.setFullYear(now.getFullYear() + 1);
  const upcomingMaturities = (debtMaturityResult.data ?? []).filter(
    (d: { maturity_date: string | null }) => {
      if (!d.maturity_date) return false;
      const matDate = new Date(d.maturity_date);
      return matDate >= now && matDate <= twelveMonthsOut;
    }
  );

  // Top 5 soonest-expiring leases for the detail section
  const soonestLeases = [...expiringLeases]
    .sort((a: { end_date: string }, b: { end_date: string }) =>
      a.end_date.localeCompare(b.end_date)
    )
    .slice(0, 5);

  const secondaryStats = [
    {
      title: "Active Deals",
      value: stats.activeDeals.toString(),
      icon: Handshake,
      description: "Deals in pipeline",
    },
    {
      title: "Properties",
      value: stats.propertiesOwned.toString(),
      icon: MapPin,
      description: "Total properties",
    },
    {
      title: "Contacts",
      value: stats.totalContacts.toString(),
      icon: Users,
      description: "Total contacts",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your portfolio"
      />

      {/* Alert banners */}
      {expiringLeases.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {expiringLeases.length} lease{expiringLeases.length !== 1 ? "s" : ""} expiring within 90 days
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Review and take action before expiration.
                </p>
              </div>
            </div>
            <Link href="/properties">
              <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950">
                View All
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {upcomingMaturities.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {upcomingMaturities.length} debt instrument{upcomingMaturities.length !== 1 ? "s" : ""} maturing within 12 months
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Plan refinancing or payoff before maturity.
                </p>
              </div>
            </div>
            <Link href="/deals">
              <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950">
                View Deals
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {overdueTasks.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Review and update your overdue tasks.
                </p>
              </div>
            </div>
            <Link href="/tasks">
              <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950">
                View Tasks
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Portfolio KPI row */}
      <PortfolioKpiCards
        aum={kpis.aum ?? 0}
        noi={kpis.noi ?? 0}
        occupancy={kpis.occupancy ?? 0}
        weightedCapRate={kpis.weightedCapRate ?? 0}
      />

      {/* Secondary stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {secondaryStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Three-column grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <MyTasksCard tasks={myTasks as Array<{ id: string; title: string; due_date: string | null; priority: string; entity_type: string | null; entity_id: string | null }>} />
        <PipelineSummary stages={pipelineStages as Array<{ stage: string; deal_count: number; total_value: number }>} />
        <DebtMaturityCard maturities={debtMaturities as Array<{ maturity_year: number; loan_count: number; total_balance: number }>} />
      </div>

      {/* Bottom row: Expiring Leases */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Expiring Leases</CardTitle>
        </CardHeader>
        <CardContent>
          {soonestLeases.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-5 w-5" />}
              title="No expiring leases"
              description="No leases expiring in the next 90 days."
            />
          ) : (
            <div className="space-y-3">
              {soonestLeases.map(
                (lease: {
                  lease_id: string;
                  property_name?: string;
                  tenant_name?: string;
                  end_date: string;
                  days_until_expiry?: number;
                }) => {
                  const daysLeft =
                    lease.days_until_expiry ??
                    Math.ceil(
                      (new Date(lease.end_date).getTime() - now.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                  return (
                    <div
                      key={lease.lease_id}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {lease.property_name ?? "Property"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {lease.tenant_name ?? "Tenant"} &middot; Expires{" "}
                          {formatDate(lease.end_date)}
                        </p>
                      </div>
                      <Badge
                        variant={daysLeft <= 30 ? "destructive" : "secondary"}
                        className="ml-2 shrink-0"
                      >
                        {daysLeft}d
                      </Badge>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
