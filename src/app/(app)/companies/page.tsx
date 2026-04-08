import { getCompanies } from "@/lib/actions/companies";
import { CompaniesListClient } from "@/components/companies/companies-list-client";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; type?: string }>;
}) {
  const params = await searchParams;
  const search = params.q ?? "";
  const page = Number(params.page) || 1;
  const type = params.type ?? "";

  const { data, count } = await getCompanies({
    search: search || undefined,
    type: type || undefined,
    page,
  });

  return (
    <CompaniesListClient
      companies={data}
      totalCount={count}
      initialSearch={search}
      initialPage={page}
      initialType={type}
    />
  );
}
