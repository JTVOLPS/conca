import Link from "next/link";
import { Handshake } from "lucide-react";
import { getDealsByStage } from "@/lib/actions/deals";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { DealsViewClient } from "./deals-view-client";
import { DealsExportWrapper } from "./deals-export-wrapper";

export default async function DealsPage() {
  const { data: deals, error } = await getDealsByStage();

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Deals" />
        <p className="text-sm text-destructive">
          Failed to load deals: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Deals" description="Track your deal pipeline">
        <DealsExportWrapper deals={deals as Record<string, unknown>[]} />
        <Link href="/deals/new">
          <Button>New Deal</Button>
        </Link>
      </PageHeader>

      {deals.length === 0 ? (
        <EmptyState
          icon={<Handshake className="h-5 w-5" />}
          title="No deals yet"
          description="Create your first deal to get started tracking your pipeline."
          action={
            <Link href="/deals/new">
              <Button size="sm">Add Deal</Button>
            </Link>
          }
        />
      ) : (
        <DealsViewClient deals={deals} />
      )}
    </div>
  );
}
