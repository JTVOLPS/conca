import { notFound } from "next/navigation";
import { getContact } from "@/lib/actions/contacts";
import { getCompanies } from "@/lib/actions/companies";
import { ContactDetailClient } from "@/components/contacts/contact-detail-client";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [contactResult, companiesResult] = await Promise.all([
    getContact(id),
    getCompanies({ pageSize: 200 }),
  ]);

  if (contactResult.error || !contactResult.data) {
    notFound();
  }

  const allCompanies = (companiesResult.data ?? []).map((c: { id: string; name: string }) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <ContactDetailClient
      contact={contactResult.data as Parameters<typeof ContactDetailClient>[0]["contact"]}
      allCompanies={allCompanies}
    />
  );
}
