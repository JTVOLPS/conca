import { notFound } from "next/navigation";
import { getCompany } from "@/lib/actions/companies";
import { EditCompanyClient } from "@/components/companies/edit-company-client";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data, error } = await getCompany(id);

  if (error || !data) {
    notFound();
  }

  return <EditCompanyClient company={data as Parameters<typeof EditCompanyClient>[0]["company"]} />;
}
