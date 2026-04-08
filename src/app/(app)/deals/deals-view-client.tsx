"use client";

import { useState } from "react";
import { LayoutGrid, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DealKanban } from "@/components/deals/deal-kanban";
import { DealTable } from "@/components/deals/deal-table";
import { cn } from "@/lib/utils";

type ViewMode = "kanban" | "table";

interface DealEconomicsRow {
  purchase_price: number | null;
  noi?: number | null;
  cap_rate_in?: number | null;
}

interface DealRow {
  id: string;
  name: string;
  stage: string;
  asset_class: string;
  stage_position: number | null;
  created_at: string;
  properties?: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
  } | null;
  deal_economics?: DealEconomicsRow | DealEconomicsRow[] | null;
}

interface DealsViewClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deals: any[];
}

function normalizeDeal(raw: DealRow): DealRow & { deal_economics?: DealEconomicsRow[] | null } {
  const econ = raw.deal_economics;
  const normalized = econ == null
    ? null
    : Array.isArray(econ)
      ? econ
      : [econ];
  return { ...raw, deal_economics: normalized };
}

export function DealsViewClient({ deals: rawDeals }: DealsViewClientProps) {
  const [view, setView] = useState<ViewMode>("kanban");
  const deals = (rawDeals as DealRow[]).map(normalizeDeal);

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex items-center gap-1 rounded-lg bg-muted p-1 w-fit">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2.5 text-xs",
            view === "kanban" && "bg-background shadow-sm"
          )}
          onClick={() => setView("kanban")}
        >
          <LayoutGrid className="h-3.5 w-3.5 mr-1" />
          Board
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2.5 text-xs",
            view === "table" && "bg-background shadow-sm"
          )}
          onClick={() => setView("table")}
        >
          <Table className="h-3.5 w-3.5 mr-1" />
          Table
        </Button>
      </div>

      {/* Content */}
      {view === "kanban" ? (
        <DealKanban deals={deals} />
      ) : (
        <DealTable data={deals} totalCount={deals.length} />
      )}
    </div>
  );
}
