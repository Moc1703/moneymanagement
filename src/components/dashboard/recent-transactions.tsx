import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionList } from "@/components/transactions/transaction-list";
import type { TransactionWithRelations } from "@/lib/types";

export function RecentTransactions({ transactions }: { transactions: TransactionWithRelations[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Transaksi Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <TransactionList transactions={transactions} compact />
      </CardContent>
    </Card>
  );
}
