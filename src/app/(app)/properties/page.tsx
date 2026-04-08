import Link from "next/link";
import { Building2 } from "lucide-react";
import { getProperties } from "@/lib/actions/properties";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { PropertiesListClient } from "./properties-list-client";

interface Props {
  searchParams: Promise<{
    search?: string;
    assetClass?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function PropertiesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = 25;

  const { data, count, error } = await getProperties({
    search: params.search,
    assetClass: params.assetClass,
    status: params.status,
    page,
    pageSize,
  });

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Properties" />
        <p className="text-sm text-destructive">
          Failed to load properties: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Properties" description="Manage your property portfolio">
        <Link href="/properties/new">
          <Button>New Property</Button>
        </Link>
      </PageHeader>

      {data.length === 0 && !params.search ? (
        <EmptyState
          icon={<Building2 className="h-5 w-5" />}
          title="No properties yet"
          description="Add your first property to get started."
          action={
            <Link href="/properties/new">
              <Button size="sm">Add Property</Button>
            </Link>
          }
        />
      ) : (
        <PropertiesListClient
          properties={data}
          totalCount={count}
          page={page}
          pageSize={pageSize}
          initialSearch={params.search ?? ""}
        />
      )}
    </div>
  );
}
