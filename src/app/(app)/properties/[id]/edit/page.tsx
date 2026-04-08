import { notFound } from "next/navigation";
import { getProperty } from "@/lib/actions/properties";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditPropertyClient } from "./edit-property-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params;
  const { data: property, error } = await getProperty(id);

  if (error || !property) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Property"
        description={property.name}
      />
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <EditPropertyClient id={id} property={property} />
        </CardContent>
      </Card>
    </div>
  );
}
