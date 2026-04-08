import Link from "next/link";
import {
  Building2,
  Handshake,
  MapPin,
  Users,
  DollarSign,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { getExpiringLeases } from "@/lib/actions/leases";
import { getDebtMaturitySchedule } from "@/lib/actions/debt-instruments";

async function getDashboardStats() {
  const supabase = await createClient();

  const [dealsResult, pipelineResult, propertiesResult, contactsResult] =
    await Promise.all([
      supabase
        .from("deals")
        .select("id", { count: "exact", head: true })
        .not("stage", "in", '("closed","dead")'),
      supabase
        .from("deal_economics")
        .select("purchase_price, deals!inner(stage)")
        .not("deals.stage", "in", '("closed","dead")'),
      supabase
        .from("properties")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("contacts")
        .select("id", { count: "exact", head: true }),
    ]);

  const pipelineValue =
    pipelineResult.data?.reduce(
      (sum, row) => sum + (row.purchase_price ?? 0),
      0
    ) ?? 0;

  return {
    activeDeals: dealsResult.count ?? 0,
    pipelineValue,
    propertiesOwned: propertiesResult.count ?? 0,
    totalContacts: contactsResult.count ?? 0,
  };
}

export default async function DashboardPage() {
  const [stats, expiringLeasesResult, debtMaturityResult] = await Promise.all([
    getDashboardStats(),
    getExpiringLeases(90),
    getDebtMaturitySchedule(),
  ]);

  const expiringLeases = expiringLeasesResult.data ?? [];

  // Filter debt maturities to within 12 months
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

  const statCards = [
    {
      title: "Active Deals",
      value: stats.activeDeals.toString(),
      icon: Handshake,
      description: "Deals in pipeline",
    },
    {
      title: "Pipeline Value",
      value: formatCurrency(stats.pipelineValue),
      icon: DollarSign,
      description: "Total purchase price",
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

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
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

      {/* Recent activity sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<Building2 className="h-5 w-5" />}
              title="No recent deals"
              description="Deals you create or update will appear here."
            />
          </CardContent>
        </Card>

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
    </div>
  );
}
