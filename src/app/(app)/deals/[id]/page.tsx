import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { getDeal } from "@/lib/actions/deals";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { DealStageBadge } from "@/components/deals/deal-stage-badge";
import { DealDetailClient } from "./deal-detail-client";
import { DeleteDealButton } from "./delete-deal-button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DealDetailPage({ params }: Props) {
  const { id } = await params;
  const { data: deal, error } = await getDeal(id);

  if (error || !deal) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title={deal.name}>
        <DealStageBadge stage={deal.stage} />
        <Link href={`/deals/${id}/edit`}>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </Link>
        <DeleteDealButton id={id} />
      </PageHeader>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <DealDetailClient deal={deal as any} />
    </div>
  );
}
