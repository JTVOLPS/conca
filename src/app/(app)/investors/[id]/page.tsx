import { notFound } from "next/navigation";
import { getInvestor } from "@/lib/actions/investors";
import { getCommitmentsByInvestor } from "@/lib/actions/commitments";
import { getDistributionsByInvestor } from "@/lib/actions/distributions";
import { InvestorDetailClient } from "@/components/investors/investor-detail-client";

export default async function InvestorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [investorResult, commitmentsResult, distributionsResult] =
    await Promise.all([
      getInvestor(id),
      getCommitmentsByInvestor(id),
      getDistributionsByInvestor(id),
    ]);

  if (investorResult.error || !investorResult.data) {
    notFound();
  }

  return (
    <InvestorDetailClient
      investor={investorResult.data as Parameters<typeof InvestorDetailClient>[0]["investor"]}
      commitments={commitmentsResult.data as Parameters<typeof InvestorDetailClient>[0]["commitments"]}
      distributions={distributionsResult.data as Parameters<typeof InvestorDetailClient>[0]["distributions"]}
    />
  );
}
