"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { updateInvestor } from "@/lib/actions/investors";
import type { InvestorFormData } from "@/lib/schemas/investor";
import { InvestorForm } from "@/components/investors/investor-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface InvestorRecord {
  id: string;
  name: string;
  type: string;
  accredited: boolean;
  contact_id: string | null;
  company_id: string | null;
  entity_name: string | null;
  tax_id: string | null;
  address_line1: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  notes: string | null;
}

interface EditInvestorClientProps {
  investor: InvestorRecord;
}

export function EditInvestorClient({ investor }: EditInvestorClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: InvestorFormData) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await updateInvestor(investor.id, data);
      if (result.error) {
        setError(result.error);
      } else {
        router.push(`/investors/${investor.id}`);
      }
    } catch {
      setError("Failed to update investor");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${investor.name}`}
        description="Update investor information"
      >
        <Link href={`/investors/${investor.id}`}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </PageHeader>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <InvestorForm
            initialData={{
              name: investor.name,
              type: investor.type as InvestorFormData["type"],
              accredited: investor.accredited,
              contact_id: investor.contact_id ?? "",
              company_id: investor.company_id ?? "",
              entity_name: investor.entity_name ?? "",
              tax_id: investor.tax_id ?? "",
              address_line1: investor.address_line1 ?? "",
              address_city: investor.address_city ?? "",
              address_state: investor.address_state ?? "",
              address_zip: investor.address_zip ?? "",
              notes: investor.notes ?? "",
            }}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
