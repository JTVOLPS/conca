import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface DebtMaturityCardProps {
  maturities: Array<{
    maturity_year: number;
    loan_count: number;
    total_balance: number;
  }>;
}

export function DebtMaturityCard({ maturities }: DebtMaturityCardProps) {
  const currentYear = new Date().getFullYear();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Debt Maturity Ladder</CardTitle>
      </CardHeader>
      <CardContent>
        {maturities.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No debt instruments tracked.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium text-muted-foreground">
                    Year
                  </th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">
                    Loans
                  </th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">
                    Total Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {maturities.map((m) => {
                  const isCurrent = m.maturity_year === currentYear;
                  return (
                    <tr
                      key={m.maturity_year}
                      className={
                        isCurrent
                          ? "bg-amber-50 dark:bg-amber-950/30 font-medium"
                          : ""
                      }
                    >
                      <td className="py-2 text-left">
                        {m.maturity_year}
                        {isCurrent && (
                          <span className="ml-1.5 text-xs text-amber-600 dark:text-amber-400">
                            (current)
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-right">{m.loan_count}</td>
                      <td className="py-2 text-right">
                        {formatCurrency(m.total_balance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
