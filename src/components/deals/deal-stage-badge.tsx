import { Badge } from "@/components/ui/badge";
import { DEAL_STAGE_MAP } from "@/lib/constants/deal-stages";
import type { DealStage } from "@/lib/constants/deal-stages";

interface DealStageBadgeProps {
  stage: string;
  className?: string;
}

export function DealStageBadge({ stage, className }: DealStageBadgeProps) {
  const info = DEAL_STAGE_MAP[stage as DealStage];

  if (!info) {
    return <Badge variant="secondary" className={className}>{stage}</Badge>;
  }

  return (
    <Badge className={`${info.color} ${className ?? ""}`}>
      {info.label}
    </Badge>
  );
}
