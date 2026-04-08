import { getContacts } from "@/lib/actions/contacts";
import { ContactsListClient } from "@/components/contacts/contacts-list-client";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; type?: string }>;
}) {
  const params = await searchParams;
  const search = params.q ?? "";
  const page = Number(params.page) || 1;
  const type = params.type ?? "";

  const { data, count } = await getContacts({
    search: search || undefined,
    type: type || undefined,
    page,
  });

  return (
    <ContactsListClient
      contacts={data}
      totalCount={count}
      initialSearch={search}
      initialPage={page}
      initialType={type}
    />
  );
}
