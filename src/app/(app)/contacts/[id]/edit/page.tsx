import { notFound } from "next/navigation";
import { getContact } from "@/lib/actions/contacts";
import { EditContactClient } from "@/components/contacts/edit-contact-client";

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data, error } = await getContact(id);

  if (error || !data) {
    notFound();
  }

  return <EditContactClient contact={data as Parameters<typeof EditContactClient>[0]["contact"]} />;
}
