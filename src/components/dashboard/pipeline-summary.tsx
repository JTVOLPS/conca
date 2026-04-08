import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEAL_STAGE_MAP } from "@/lib/constants/deal-stages";
import { formatCurrency } from "@/lib/utils";

interface PipelineSummaryProps {
  stages: Array<{
    stage: string;
    deal_count: number;
    total_value: number;
  }>;
}

export function PipelineSummary({ stages }: PipelineSummaryProps) {
  const maxValue = Math.max(...stages.map((s) => s.total_value), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pipeline Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {stages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No deals in pipeline.</p>
        ) : (
          <div className="space-y-3">
            {stages.map((s) => {
              const stageInfo =
                DEAL_STAGE_MAP[s.stage as keyof typeof DEAL_STAGE_MAP];
              const widthPercent = (s.total_value / maxValue) * 100;

              return (
                <div key={s.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge className={stageInfo?.color ?? ""}>
                        {stageInfo?.label ?? s.stage}
                      </Badge>
                      <span className="text-muted-foreground">
                        {s.deal_count} deal{s.deal_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(s.total_value)}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
