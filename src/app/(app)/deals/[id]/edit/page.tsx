import { notFound } from "next/navigation";
import { getDeal } from "@/lib/actions/deals";
import { getProperties } from "@/lib/actions/properties";
import { getContacts } from "@/lib/actions/contacts";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditDealClient } from "./edit-deal-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditDealPage({ params }: Props) {
  const { id } = await params;
  const [dealResult, propertiesResult, contactsResult] = await Promise.all([
    getDeal(id),
    getProperties({ pageSize: 500 }),
    getContacts({ pageSize: 500 }),
  ]);

  if (dealResult.error || !dealResult.data) {
    notFound();
  }

  const properties = (propertiesResult.data ?? []).map(
    (p: { id: string; name: string }) => ({
      id: p.id,
      label: p.name,
    })
  );

  const contacts = (contactsResult.data ?? []).map(
    (c: { id: string; first_name: string; last_name: string }) => ({
      id: c.id,
      label: `${c.first_name} ${c.last_name}`.trim(),
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Deal"
        description={dealResult.data.name}
      />
      <Card>
        <CardHeader>
          <CardTitle>Deal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <EditDealClient
            id={id}
            deal={dealResult.data}
            properties={properties}
            contacts={contacts}
          />
        </CardContent>
      </Card>
    </div>
  );
}
