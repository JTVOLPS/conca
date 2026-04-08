import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Calendar,
  Ruler,
  Layers,
  Hash,
  Pencil,
  Trash2,
} from "lucide-react";
import { getProperty } from "@/lib/actions/properties";
import { ASSET_CLASS_MAP } from "@/lib/constants/asset-classes";
import { DEAL_STAGE_MAP } from "@/lib/constants/deal-stages";
import { formatNumber, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { DeletePropertyButton } from "./delete-property-button";

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  under_contract: "Under Contract",
  closed: "Closed",
  disposed: "Disposed",
  watch_list: "Watch List",
};

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const { data: property, error } = await getProperty(id);

  if (error || !property) {
    notFound();
  }

  const ac = ASSET_CLASS_MAP[property.asset_class as keyof typeof ASSET_CLASS_MAP];
  const deals = (property.deals ?? []) as Array<{
    id: string;
    name: string;
    stage: string;
    asset_class: string;
  }>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={property.name}
        description={ac?.label ?? property.asset_class}
      >
        <Link href={`/properties/${id}/edit`}>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </Link>
        <DeletePropertyButton id={id} />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
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
                    <dd className="mt-1 text-sm">{property.parcel_number}</dd>
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
                <p className="text-sm whitespace-pre-wrap">{property.notes}</p>
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

          {property.tags && property.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {property.tags.map((tag: string) => (
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
    </div>
  );
}
