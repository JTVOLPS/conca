import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { NewPropertyClient } from "./new-property-client";

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="New Property" description="Add a property to your portfolio" />
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <NewPropertyClient />
        </CardContent>
      </Card>
    </div>
  );
}
