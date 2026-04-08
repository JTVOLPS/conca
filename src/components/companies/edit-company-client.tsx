"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { updateCompany } from "@/lib/actions/companies";
import type { CompanyFormData } from "@/lib/schemas/company";
import { CompanyForm } from "@/components/companies/company-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CompanyRecord {
  id: string;
  name: string;
  type: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  notes: string | null;
  tags: string[] | null;
}

interface EditCompanyClientProps {
  company: CompanyRecord;
}

export function EditCompanyClient({ company }: EditCompanyClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: CompanyFormData) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await updateCompany(company.id, data);
      if (result.error) {
        setError(result.error);
      } else {
        router.push(`/companies/${company.id}`);
      }
    } catch {
      setError("Failed to update company");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${company.name}`}
        description="Update company information"
      >
        <Link href={`/companies/${company.id}`}>
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
          <CompanyForm
            initialData={{
              name: company.name,
              type: (company.type as CompanyFormData["type"]) ?? null,
              website: company.website ?? "",
              phone: company.phone ?? "",
              email: company.email ?? "",
              address_line1: company.address_line1 ?? "",
              address_line2: company.address_line2 ?? "",
              city: company.city ?? "",
              state: company.state ?? "",
              zip: company.zip ?? "",
              country: company.country ?? "US",
              notes: company.notes ?? "",
              tags: company.tags ?? [],
            }}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
