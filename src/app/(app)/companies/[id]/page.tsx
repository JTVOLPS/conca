import { notFound } from "next/navigation";
import { getCompany } from "@/lib/actions/companies";
import { CompanyDetailClient } from "@/components/companies/company-detail-client";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data, error } = await getCompany(id);

  if (error || !data) {
    notFound();
  }

  return (
    <CompanyDetailClient
      company={data as Parameters<typeof CompanyDetailClient>[0]["company"]}
    />
  );
}
