import {
  Building2,
  Handshake,
  MapPin,
  Users,
  ClipboardList,
  DollarSign,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

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
  const stats = await getDashboardStats();

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
            <CardTitle className="text-base">Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<ClipboardList className="h-5 w-5" />}
              title="No upcoming tasks"
              description="Tasks assigned to you will appear here."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
