"use client";

import Link from "next/link";
import { MapPin, Calendar, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ASSET_CLASS_MAP } from "@/lib/constants/asset-classes";
import { DEAL_STAGE_MAP } from "@/lib/constants/deal-stages";
import { formatDate } from "@/lib/utils";
import { DealStageHistory } from "@/components/deals/deal-stage-history";
import { DealCustomFields } from "@/components/deals/deal-custom-fields";

interface StageHistoryEntry {
  id: string;
  from_stage: string | null;
  to_stage: string;
  changed_by: string;
  changed_at: string;
}

interface DealOverviewTabProps {
  deal: Record<string, unknown>;
  stageHistory: StageHistoryEntry[];
}

export function DealOverviewTab({ deal, stageHistory }: DealOverviewTabProps) {
  const property = deal.properties as Record<string, unknown> | null;
  const assetClass = ASSET_CLASS_MAP[deal.asset_class as keyof typeof ASSET_CLASS_MAP];
  const stage = DEAL_STAGE_MAP[deal.stage as keyof typeof DEAL_STAGE_MAP];
  const tags = (deal.tags as string[]) ?? [];
  const customFields = (deal.custom_fields as Record<string, unknown>) ?? {};

  const dateFields = [
    { label: "Sourced", value: deal.sourced_at },
    { label: "LOI Submitted", value: deal.loi_submitted_at },
    { label: "LOI Accepted", value: deal.loi_accepted_at },
    { label: "Contract Date", value: deal.contract_date },
    { label: "DD Start", value: deal.due_diligence_start },
    { label: "DD End", value: deal.due_diligence_end },
    { label: "Closing Date", value: deal.closing_date },
  ].filter((d) => d.value);

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deal Info */}
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Deal Information</h3>
          <div className="grid gap-3">
            <div>
              <span className="text-xs text-muted-foreground">Asset Class</span>
              <p className="text-sm font-medium">{assetClass?.label ?? deal.asset_class}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Stage</span>
              <p className="text-sm font-medium">{stage?.label ?? deal.stage}</p>
            </div>
            {Boolean(deal.lead_source) && (
              <div>
                <span className="text-xs text-muted-foreground">Lead Source</span>
                <p className="text-sm">{deal.lead_source as string}</p>
              </div>
            )}
            {Boolean(deal.description) && (
              <div>
                <span className="text-xs text-muted-foreground">Description</span>
                <p className="text-sm">{deal.description as string}</p>
              </div>
            )}
            {Boolean(deal.notes) && (
              <div>
                <span className="text-xs text-muted-foreground">Notes</span>
                <p className="text-sm whitespace-pre-wrap">{deal.notes as string}</p>
              </div>
            )}
            {tags.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground">Tags</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Property & Dates */}
        <div className="space-y-4">
          {property && (
            <div className="rounded-lg border p-4 space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Property</h3>
              <Link
                href={`/properties/${property.id}`}
                className="flex items-center gap-2 text-sm font-medium hover:underline"
              >
                <MapPin className="h-4 w-4" />
                {property.name as string}
              </Link>
              {(Boolean(property.city) || Boolean(property.state)) && (
                <p className="text-sm text-muted-foreground">
                  {[property.city as string, property.state as string].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          )}

          {dateFields.length > 0 && (
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Key Dates</h3>
              <div className="space-y-2">
                {dateFields.map((d) => (
                  <div key={d.label} className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground w-28">{d.label}</span>
                    <span>{formatDate(d.value as string)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Fields */}
      {Object.keys(customFields).length > 0 && (
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {assetClass?.label ?? "Custom"} Details
          </h3>
          <DealCustomFields
            assetClass={deal.asset_class as string}
            values={customFields}
            readOnly
          />
        </div>
      )}

      {/* Stage History */}
      {stageHistory.length > 0 && (
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Stage History</h3>
          <DealStageHistory history={stageHistory} />
        </div>
      )}
    </div>
  );
}
