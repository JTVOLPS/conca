"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createContact } from "@/lib/actions/contacts";
import type { ContactFormData } from "@/lib/schemas/contact";
import { ContactForm } from "@/components/contacts/contact-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NewContactPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: ContactFormData) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await createContact(data);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        router.push(`/contacts/${result.data.id}`);
      }
    } catch {
      setError("Failed to create contact");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New Contact" description="Add a new contact to your CRM">
        <Link href="/contacts">
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
          <ContactForm onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
