"use client";

import Link from "next/link";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ASSET_CLASS_MAP } from "@/lib/constants/asset-classes";
import { formatDate } from "@/lib/utils";
import { DealStageBadge } from "@/components/deals/deal-stage-badge";
import { DealEconomicsForm } from "@/components/deals/deal-economics-form";
import { DealContactsPanel } from "@/components/deals/deal-contacts-panel";
import { DealStageHistory } from "@/components/deals/deal-stage-history";
import { DealCustomFields } from "@/components/deals/deal-custom-fields";
import { DealActivityPanel } from "./deal-activity-panel";
import { DealCapexTab } from "@/components/deals/deal-capex-tab";
import { DealDebtTab } from "@/components/deals/deal-debt-tab";
import { DealDocumentsTab } from "@/components/deals/deal-documents-tab";
import { DealInvestorsTab } from "@/components/deals/deal-investors-tab";
import { DealWaterfallEditor } from "@/components/deals/deal-waterfall-editor";
import { EntityTasksPanel } from "@/components/tasks/entity-tasks-panel";
import {
  MapPin,
  Calendar,
  Building2,
  FileText,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DealProperty {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  asset_class?: string;
}

interface DealContact {
  id: string;
  contact_id: string;
  role: string | null;
  contacts: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    type: string | null;
  };
}

interface StageHistoryEntry {
  id: string;
  from_stage: string | null;
  to_stage: string;
  changed_by: string;
  changed_at: string;
}

interface InteractionEntry {
  id: string;
  type: string;
  subject: string | null;
  body: string | null;
  occurred_at: string;
  logged_by: string;
}

interface DealData {
  id: string;
  name: string;
  asset_class: string;
  stage: string;
  lead_source?: string | null;
  description?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  dead_reason?: string | null;
  created_at: string;
  updated_at: string;
  stage_changed_at?: string | null;
  sourced_at?: string | null;
  loi_submitted_at?: string | null;
  loi_accepted_at?: string | null;
  contract_date?: string | null;
  due_diligence_start?: string | null;
  due_diligence_end?: string | null;
  closing_date?: string | null;
  dead_at?: string | null;
  custom_fields?: Record<string, unknown> | null;
  properties?: DealProperty | null;
  deal_economics?: Record<string, unknown> | null;
  deal_contacts?: DealContact[];
  deal_stage_history?: StageHistoryEntry[];
  interactions?: InteractionEntry[];
}

interface DealDetailClientProps {
  deal: DealData;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DealDetailClient({ deal }: DealDetailClientProps) {
  const property = deal.properties ?? null;
  const economics = deal.deal_economics ?? null;
  const contacts = deal.deal_contacts ?? [];
  const stageHistory = deal.deal_stage_history ?? [];
  const interactions = deal.interactions ?? [];
  const tags = deal.tags ?? [];
  const customFields = deal.custom_fields ?? {};

  const ac = ASSET_CLASS_MAP[deal.asset_class as keyof typeof ASSET_CLASS_MAP];

  // Key dates for display
  const keyDates = [
    { label: "Sourced", value: deal.sourced_at },
    { label: "LOI Submitted", value: deal.loi_submitted_at },
    { label: "LOI Accepted", value: deal.loi_accepted_at },
    { label: "Contract Date", value: deal.contract_date },
    { label: "DD Start", value: deal.due_diligence_start },
    { label: "DD End", value: deal.due_diligence_end },
    { label: "Closing Date", value: deal.closing_date },
    { label: "Dead Date", value: deal.dead_at },
  ].filter((d): d is { label: string; value: string } => Boolean(d.value));

  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="economics">Economics</TabsTrigger>
        <TabsTrigger value="contacts">Contacts</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="capex">CapEx</TabsTrigger>
        <TabsTrigger value="debt">Debt</TabsTrigger>
        <TabsTrigger value="investors">Investors</TabsTrigger>
        <TabsTrigger value="waterfall">Waterfall</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview">
        <div className="grid gap-6 lg:grid-cols-3 mt-4">
          <div className="lg:col-span-2 space-y-6">
            {/* Deal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Deal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Asset Class
                    </dt>
                    <dd className="mt-1">
                      <Badge variant="secondary">
                        {ac?.label ?? deal.asset_class}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Stage
                    </dt>
                    <dd className="mt-1">
                      <DealStageBadge stage={deal.stage} />
                    </dd>
                  </div>
                  {property && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" /> Property
                      </dt>
                      <dd className="mt-1">
                        <Link
                          href={`/properties/${property.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {property.name}
                        </Link>
                        {(property.city || property.state) && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {[property.city, property.state]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        )}
                      </dd>
                    </div>
                  )}
                  {deal.lead_source && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Lead Source
                      </dt>
                      <dd className="mt-1 text-sm">{deal.lead_source}</dd>
                    </div>
                  )}
                  {deal.description && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" /> Description
                      </dt>
                      <dd className="mt-1 text-sm whitespace-pre-wrap">
                        {deal.description}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* Key Dates */}
            {keyDates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Key Dates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
                    <ul className="space-y-4">
                      {keyDates.map((d) => (
                        <li
                          key={d.label}
                          className="flex items-center gap-4 relative pl-8"
                        >
                          <div className="absolute left-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                          <div>
                            <p className="text-sm font-medium">{d.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(d.value)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stage History */}
            {stageHistory.length > 0 && (
              <DealStageHistory history={stageHistory} />
            )}

            {/* Custom fields */}
            {Object.keys(customFields).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Custom Fields</CardTitle>
                </CardHeader>
                <CardContent>
                  <DealCustomFields
                    assetClass={deal.asset_class}
                    values={customFields}
                    onChange={() => {}}
                    readOnly
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {deal.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{deal.notes}</p>
                </CardContent>
              </Card>
            )}

            {tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {deal.dead_reason && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-destructive">
                    Dead Reason
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{deal.dead_reason}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Created</dt>
                    <dd>{formatDate(deal.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Last Updated</dt>
                    <dd>{formatDate(deal.updated_at)}</dd>
                  </div>
                  {deal.stage_changed_at && (
                    <div>
                      <dt className="text-muted-foreground">Stage Changed</dt>
                      <dd>{formatDate(deal.stage_changed_at)}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      {/* Economics Tab */}
      <TabsContent value="economics">
        <div className="mt-4">
          <DealEconomicsForm dealId={deal.id} initialData={economics} />
        </div>
      </TabsContent>

      {/* Contacts Tab */}
      <TabsContent value="contacts">
        <div className="mt-4">
          <DealContactsPanel dealId={deal.id} contacts={contacts} />
        </div>
      </TabsContent>

      {/* Activity Tab */}
      <TabsContent value="activity">
        <div className="mt-4">
          <DealActivityPanel dealId={deal.id} interactions={interactions} />
        </div>
      </TabsContent>

      {/* Tasks Tab */}
      <TabsContent value="tasks">
        <div className="mt-4">
          <EntityTasksPanel entityType="deal" entityId={deal.id} />
        </div>
      </TabsContent>

      {/* CapEx Tab */}
      <TabsContent value="capex">
        <div className="mt-4">
          <DealCapexTab dealId={deal.id} />
        </div>
      </TabsContent>

      {/* Debt Tab */}
      <TabsContent value="debt">
        <div className="mt-4">
          <DealDebtTab dealId={deal.id} />
        </div>
      </TabsContent>

      {/* Investors Tab */}
      <TabsContent value="investors">
        <div className="mt-4">
          <DealInvestorsTab dealId={deal.id} economics={economics as Parameters<typeof DealInvestorsTab>[0]["economics"]} />
        </div>
      </TabsContent>

      {/* Waterfall Tab */}
      <TabsContent value="waterfall">
        <div className="mt-4">
          <DealWaterfallEditor dealId={deal.id} />
        </div>
      </TabsContent>

      {/* Documents Tab */}
      <TabsContent value="documents">
        <div className="mt-4">
          <DealDocumentsTab dealId={deal.id} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
