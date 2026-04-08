import {
  DollarSign,
  TrendingUp,
  Building2,
  Percent,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface PortfolioKpiCardsProps {
  aum: number;
  noi: number;
  occupancy: number;
  weightedCapRate: number;
}

export function PortfolioKpiCards({
  aum,
  noi,
  occupancy,
  weightedCapRate,
}: PortfolioKpiCardsProps) {
  const cards = [
    {
      title: "Assets Under Management",
      value: formatCurrency(aum),
      icon: DollarSign,
      description: "Total portfolio value",
    },
    {
      title: "Total NOI",
      value: formatCurrency(noi),
      icon: TrendingUp,
      description: "Net operating income",
    },
    {
      title: "Occupancy",
      value: formatPercent(occupancy),
      icon: Building2,
      description: "Portfolio occupancy rate",
    },
    {
      title: "Weighted Cap Rate",
      value: formatPercent(weightedCapRate),
      icon: Percent,
      description: "Value-weighted cap rate",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
