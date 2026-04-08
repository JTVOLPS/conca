"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { updateContact } from "@/lib/actions/contacts";
import type { ContactFormData } from "@/lib/schemas/contact";
import { ContactForm } from "@/components/contacts/contact-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ContactRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  title: string | null;
  type: string | null;
  source: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  notes: string | null;
  tags: string[] | null;
}

interface EditContactClientProps {
  contact: ContactRecord;
}

export function EditContactClient({ contact }: EditContactClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullName = `${contact.first_name} ${contact.last_name}`;

  async function handleSubmit(data: ContactFormData) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await updateContact(contact.id, data);
      if (result.error) {
        setError(result.error);
      } else {
        router.push(`/contacts/${contact.id}`);
      }
    } catch {
      setError("Failed to update contact");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${fullName}`}
        description="Update contact information"
      >
        <Link href={`/contacts/${contact.id}`}>
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
          <ContactForm
            initialData={{
              first_name: contact.first_name,
              last_name: contact.last_name,
              email: contact.email ?? "",
              phone: contact.phone ?? "",
              mobile: contact.mobile ?? "",
              title: contact.title ?? "",
              type: (contact.type as ContactFormData["type"]) ?? null,
              source: contact.source ?? "",
              address_line1: contact.address_line1 ?? "",
              address_line2: contact.address_line2 ?? "",
              city: contact.city ?? "",
              state: contact.state ?? "",
              zip: contact.zip ?? "",
              country: contact.country ?? "US",
              notes: contact.notes ?? "",
              tags: contact.tags ?? [],
            }}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
