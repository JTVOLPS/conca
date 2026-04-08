"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DEAL_STAGES, type DealStage } from "@/lib/constants/deal-stages";
import { ASSET_CLASS_MAP } from "@/lib/constants/asset-classes";
import { updateDealStage } from "@/lib/actions/deals";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { GripVertical, MapPin } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DealEconomics {
  purchase_price: number | null;
  noi?: number | null;
  cap_rate_in?: number | null;
}

interface DealProperty {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
}

interface KanbanDeal {
  id: string;
  name: string;
  stage: string;
  asset_class: string;
  stage_position: number | null;
  properties?: DealProperty | null;
  deal_economics?: DealEconomics[] | null;
}

interface DealKanbanProps {
  deals: KanbanDeal[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPurchasePrice(deal: KanbanDeal): number | null {
  const econ = deal.deal_economics;
  if (Array.isArray(econ) && econ.length > 0) return econ[0].purchase_price;
  return null;
}

function groupDealsByStage(deals: KanbanDeal[]) {
  const groups: Record<string, KanbanDeal[]> = {};
  for (const stage of DEAL_STAGES) {
    groups[stage.value] = [];
  }
  for (const deal of deals) {
    if (groups[deal.stage]) {
      groups[deal.stage].push(deal);
    }
  }
  // Sort each column by stage_position
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => (a.stage_position ?? 0) - (b.stage_position ?? 0));
  }
  return groups;
}

// ---------------------------------------------------------------------------
// KanbanCard
// ---------------------------------------------------------------------------

interface KanbanCardProps {
  deal: KanbanDeal;
  isDragOverlay?: boolean;
}

function KanbanCard({ deal, isDragOverlay }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const ac = ASSET_CLASS_MAP[deal.asset_class as keyof typeof ASSET_CLASS_MAP];
  const prop = deal.properties;
  const price = getPurchasePrice(deal);

  const card = (
    <div
      ref={!isDragOverlay ? setNodeRef : undefined}
      style={!isDragOverlay ? style : undefined}
      className={cn(
        "group rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
        isDragging && "opacity-50",
        isDragOverlay && "shadow-lg ring-2 ring-primary/20"
      )}
      {...(!isDragOverlay ? attributes : {})}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          {...(!isDragOverlay ? listeners : {})}
          tabIndex={-1}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <Link
            href={`/deals/${deal.id}`}
            className="text-sm font-medium hover:underline line-clamp-1"
            onClick={(e) => {
              if (isDragOverlay) e.preventDefault();
            }}
          >
            {deal.name}
          </Link>
          {ac && (
            <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0">
              {ac.label}
            </Badge>
          )}
          {prop && (
            <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {prop.name}
                {prop.city ? ` - ${prop.city}` : ""}
                {prop.state ? `, ${prop.state}` : ""}
              </span>
            </div>
          )}
          {price != null && (
            <div className="mt-1.5 text-xs font-semibold">
              {formatCurrency(price)}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return card;
}

// ---------------------------------------------------------------------------
// KanbanColumn
// ---------------------------------------------------------------------------

interface KanbanColumnProps {
  stage: (typeof DEAL_STAGES)[number];
  deals: KanbanDeal[];
}

function KanbanColumn({ stage, deals }: KanbanColumnProps) {
  const totalValue = deals.reduce((sum, d) => {
    const price = getPurchasePrice(d);
    return sum + (price ?? 0);
  }, 0);

  const dealIds = deals.map((d) => d.id);

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/50 border">
      {/* Column header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{stage.label}</h3>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
              {deals.length}
            </span>
          </div>
          {totalValue > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatCurrency(totalValue)}
            </p>
          )}
        </div>
      </div>

      {/* Cards */}
      <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2 overflow-y-auto p-2 min-h-[100px]">
          {deals.length === 0 && (
            <div className="flex h-20 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
              No deals
            </div>
          )}
          {deals.map((deal) => (
            <KanbanCard key={deal.id} deal={deal} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DealKanban (main)
// ---------------------------------------------------------------------------

export function DealKanban({ deals: initialDeals }: DealKanbanProps) {
  const [deals, setDeals] = useState(initialDeals);
  const [activeId, setActiveId] = useState<string | null>(null);

  const grouped = useMemo(() => groupDealsByStage(deals), [deals]);

  const activeDeal = useMemo(
    () => (activeId ? deals.find((d) => d.id === activeId) ?? null : null),
    [activeId, deals]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null);

      const { active, over } = event;
      if (!over) return;

      const draggedDealId = String(active.id);
      const draggedDeal = deals.find((d) => d.id === draggedDealId);
      if (!draggedDeal) return;

      // Determine target stage and position
      let targetStage: string;
      let targetPosition: number;

      // The over could be a deal or a column droppable
      const overDeal = deals.find((d) => d.id === String(over.id));
      if (overDeal) {
        targetStage = overDeal.stage;
        const stageDeals = grouped[targetStage] ?? [];
        const overIndex = stageDeals.findIndex((d) => d.id === overDeal.id);
        targetPosition = overIndex >= 0 ? overIndex : stageDeals.length;
      } else {
        // Dropped over a stage identifier
        const stageValue = String(over.id);
        const validStage = DEAL_STAGES.find((s) => s.value === stageValue);
        targetStage = validStage ? stageValue : draggedDeal.stage;
        targetPosition = (grouped[targetStage] ?? []).length;
      }

      // No change needed
      if (
        draggedDeal.stage === targetStage &&
        (draggedDeal.stage_position ?? 0) === targetPosition
      ) {
        return;
      }

      // Optimistic update
      const previousDeals = [...deals];
      setDeals((prev) =>
        prev.map((d) =>
          d.id === draggedDealId
            ? { ...d, stage: targetStage, stage_position: targetPosition }
            : d
        )
      );

      // Server update
      const { error } = await updateDealStage(
        draggedDealId,
        targetStage as DealStage,
        targetPosition
      );

      if (error) {
        // Revert on failure
        setDeals(previousDeals);
        console.error("Failed to update deal stage:", error);
      }
    },
    [deals, grouped]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {DEAL_STAGES.map((stage) => (
          <KanbanColumn
            key={stage.value}
            stage={stage}
            deals={grouped[stage.value] ?? []}
          />
        ))}
      </div>

      <DragOverlay>
        {activeDeal ? (
          <div className="w-72">
            <KanbanCard deal={activeDeal} isDragOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
