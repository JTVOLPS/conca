"use client";

import { ArrowRight } from "lucide-react";
import { DEAL_STAGE_MAP } from "@/lib/constants/deal-stages";
import { DealStageBadge } from "@/components/deals/deal-stage-badge";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StageHistoryEntry {
  id: string;
  from_stage: string | null;
  to_stage: string;
  changed_by: string;
  changed_at: string;
}

interface DealStageHistoryProps {
  history: StageHistoryEntry[];
}

export function DealStageHistory({ history }: DealStageHistoryProps) {
  const sorted = [...history].sort(
    (a, b) =>
      new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Stage History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
          <ul className="space-y-4">
            {sorted.map((entry) => {
              const fromStage = entry.from_stage
                ? DEAL_STAGE_MAP[
                    entry.from_stage as keyof typeof DEAL_STAGE_MAP
                  ]
                : null;
              const toStage =
                DEAL_STAGE_MAP[
                  entry.to_stage as keyof typeof DEAL_STAGE_MAP
                ];

              return (
                <li
                  key={entry.id}
                  className="flex items-center gap-3 relative pl-8"
                >
                  <div className="absolute left-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(entry.changed_at)}
                    </span>
                    {fromStage ? (
                      <>
                        <DealStageBadge stage={entry.from_stage!} />
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <DealStageBadge stage={entry.to_stage} />
                      </>
                    ) : (
                      <span className="text-sm">
                        Created in{" "}
                        <span className="font-medium">
                          {toStage?.label ?? entry.to_stage}
                        </span>
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
