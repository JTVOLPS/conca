"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createInvestor } from "@/lib/actions/investors";
import type { InvestorFormData } from "@/lib/schemas/investor";
import { InvestorForm } from "@/components/investors/investor-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NewInvestorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: InvestorFormData) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await createInvestor(data);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        router.push(`/investors/${result.data.id}`);
      }
    } catch {
      setError("Failed to create investor");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New Investor" description="Add a new investor">
        <Link href="/investors">
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
          <InvestorForm onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
