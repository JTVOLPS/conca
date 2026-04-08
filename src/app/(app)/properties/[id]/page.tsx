import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { getProperty } from "@/lib/actions/properties";
import { ASSET_CLASS_MAP } from "@/lib/constants/asset-classes";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PropertyDetailClient } from "@/components/properties/property-detail-client";
import { DeletePropertyButton } from "./delete-property-button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const { data: property, error } = await getProperty(id);

  if (error || !property) {
    notFound();
  }

  const ac = ASSET_CLASS_MAP[property.asset_class as keyof typeof ASSET_CLASS_MAP];

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

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <PropertyDetailClient property={property as any} />
    </div>
  );
}
