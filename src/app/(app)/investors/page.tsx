import { getInvestors } from "@/lib/actions/investors";
import { InvestorsListClient } from "@/components/investors/investors-list-client";

export default async function InvestorsPage() {
  const { data } = await getInvestors();

  return <InvestorsListClient investors={data} />;
}
