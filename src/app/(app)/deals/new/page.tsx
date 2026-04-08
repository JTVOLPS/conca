import { getProperties } from "@/lib/actions/properties";
import { getContacts } from "@/lib/actions/contacts";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewDealClient } from "./new-deal-client";

export default async function NewDealPage() {
  const [propertiesResult, contactsResult] = await Promise.all([
    getProperties({ pageSize: 500 }),
    getContacts({ pageSize: 500 }),
  ]);

  const properties = (propertiesResult.data ?? []).map((p: { id: string; name: string }) => ({
    id: p.id,
    label: p.name,
  }));

  const contacts = (contactsResult.data ?? []).map(
    (c: { id: string; first_name: string; last_name: string }) => ({
      id: c.id,
      label: `${c.first_name} ${c.last_name}`.trim(),
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader title="New Deal" description="Create a new deal in your pipeline" />
      <Card>
        <CardHeader>
          <CardTitle>Deal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <NewDealClient properties={properties} contacts={contacts} />
        </CardContent>
      </Card>
    </div>
  );
}
