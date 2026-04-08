import { notFound } from "next/navigation";
import { getInvestor } from "@/lib/actions/investors";
import { EditInvestorClient } from "@/components/investors/edit-investor-client";

export default async function EditInvestorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data, error } = await getInvestor(id);

  if (error || !data) {
    notFound();
  }

  return <EditInvestorClient investor={data as Parameters<typeof EditInvestorClient>[0]["investor"]} />;
}
