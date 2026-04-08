"use client";

import Link from "next/link";
import {
  MapPin,
  Building2,
  Calendar,
  Ruler,
  Layers,
  Hash,
} from "lucide-react";
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
import { DEAL_STAGE_MAP } from "@/lib/constants/deal-stages";
import { formatNumber, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { RentRollTab } from "./rent-roll-tab";
import { FinancialsTab } from "./financials-tab";
import { CapexTab } from "./capex-tab";
import { DebtTab } from "./debt-tab";
import { DocumentsTab } from "./documents-tab";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PropertyDetailClientProps {
  property: {
    id: string;
    name: string;
    asset_class: string;
    status: string;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    county?: string | null;
    year_built?: number | null;
    total_sf?: number | null;
    lot_size_acres?: number | null;
    num_units?: number | null;
    zoning?: string | null;
    parcel_number?: string | null;
    notes?: string | null;
    tags?: string[] | null;
    custom_fields?: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    deals?: Array<{
      id: string;
      name: string;
      stage: string;
      asset_class: string;
    }>;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  under_contract: "Under Contract",
  closed: "Closed",
  disposed: "Disposed",
  watch_list: "Watch List",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const ac =
    ASSET_CLASS_MAP[property.asset_class as keyof typeof ASSET_CLASS_MAP];
  const deals = property.deals ?? [];
  const tags = property.tags ?? [];

  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="rent-roll">Rent Roll</TabsTrigger>
        <TabsTrigger value="financials">Financials</TabsTrigger>
        <TabsTrigger value="capex">CapEx</TabsTrigger>
        <TabsTrigger value="debt">Debt</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview">
        <div className="grid gap-6 lg:grid-cols-3 mt-4">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Asset Class
                    </dt>
                    <dd className="mt-1">
                      <Badge variant="secondary">
                        {ac?.label ?? property.asset_class}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Status
                    </dt>
                    <dd className="mt-1 text-sm">
                      {STATUS_LABELS[property.status] ?? property.status}
                    </dd>
                  </div>
                  {property.address_line1 && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> Address
                      </dt>
                      <dd className="mt-1 text-sm">
                        {property.address_line1}
                        {property.address_line2 && (
                          <>, {property.address_line2}</>
                        )}
                        <br />
                        {[property.city, property.state, property.zip]
                          .filter(Boolean)
                          .join(", ")}
                        {property.county && (
                          <span className="text-muted-foreground">
                            {" "}
                            ({property.county})
                          </span>
                        )}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Physical Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {property.year_built && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Year Built
                      </dt>
                      <dd className="mt-1 text-sm">{property.year_built}</dd>
                    </div>
                  )}
                  {property.total_sf != null && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Ruler className="h-3.5 w-3.5" /> Total SF
                      </dt>
                      <dd className="mt-1 text-sm">
                        {formatNumber(property.total_sf)}
                      </dd>
                    </div>
                  )}
                  {property.lot_size_acres != null && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Lot Size
                      </dt>
                      <dd className="mt-1 text-sm">
                        {property.lot_size_acres} acres
                      </dd>
                    </div>
                  )}
                  {property.num_units != null && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" /> Units
                      </dt>
                      <dd className="mt-1 text-sm">
                        {formatNumber(property.num_units)}
                      </dd>
                    </div>
                  )}
                  {property.zoning && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" /> Zoning
                      </dt>
                      <dd className="mt-1 text-sm">{property.zoning}</dd>
                    </div>
                  )}
                  {property.parcel_number && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Hash className="h-3.5 w-3.5" /> Parcel Number
                      </dt>
                      <dd className="mt-1 text-sm">
                        {property.parcel_number}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {property.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">
                    {property.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Linked Deals</CardTitle>
              </CardHeader>
              <CardContent>
                {deals.length === 0 ? (
                  <EmptyState
                    title="No deals linked"
                    description="Deals attached to this property will appear here."
                    className="border-0 p-4"
                  />
                ) : (
                  <ul className="space-y-3">
                    {deals.map((deal) => {
                      const stage =
                        DEAL_STAGE_MAP[
                          deal.stage as keyof typeof DEAL_STAGE_MAP
                        ];
                      return (
                        <li key={deal.id}>
                          <Link
                            href={`/deals/${deal.id}`}
                            className="block rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                          >
                            <div className="font-medium text-sm">
                              {deal.name}
                            </div>
                            {stage && (
                              <Badge className={`mt-1 ${stage.color}`}>
                                {stage.label}
                              </Badge>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

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

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Created</dt>
                    <dd>{formatDate(property.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Last Updated</dt>
                    <dd>{formatDate(property.updated_at)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      {/* Rent Roll Tab */}
      <TabsContent value="rent-roll">
        <RentRollTab
          propertyId={property.id}
          propertyTotalSf={property.total_sf}
        />
      </TabsContent>

      {/* Financials Tab */}
      <TabsContent value="financials">
        <FinancialsTab propertyId={property.id} />
      </TabsContent>

      {/* CapEx Tab */}
      <TabsContent value="capex">
        <CapexTab propertyId={property.id} />
      </TabsContent>

      {/* Debt Tab */}
      <TabsContent value="debt">
        <DebtTab propertyId={property.id} />
      </TabsContent>

      {/* Documents Tab */}
      <TabsContent value="documents">
        <DocumentsTab propertyId={property.id} />
      </TabsContent>
    </Tabs>
  );
}
