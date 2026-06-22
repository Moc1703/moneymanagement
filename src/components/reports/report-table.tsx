import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR, formatDate } from "@/lib/utils/format";
import type { TransactionWithRelations } from "@/lib/types";

export function ReportTable({ transactions }: { transactions: TransactionWithRelations[] }) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Detail Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 text-center py-6">Tidak ada transaksi</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Detail Transaksi</CardTitle>
        <p className="text-xs text-slate-500">{transactions.length} transaksi</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {transactions.map((tx) => {
            const isIncome = tx.type === "income";
            return (
              <div key={tx.id} className="flex items-center gap-3 p-3">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-lg text-base shrink-0"
                  style={{ backgroundColor: tx.category ? `${tx.category.color}25` : "#f1f5f9" }}
                >
                  {tx.category?.icon ?? "•"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {tx.description || tx.category?.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 flex-wrap">
                    <span>{formatDate(tx.date)}</span>
                    {tx.account && (
                      <>
                        <span>·</span>
                        <span>{tx.account.icon} {tx.account.name.replace("Rekening ", "")}</span>
                      </>
                    )}
                    {tx.project && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: tx.project.color }}
                          />
                          {tx.project.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div
                  className={`font-semibold text-sm shrink-0 ${
                    isIncome ? "text-emerald-600" : "text-slate-900"
                  }`}
                >
                  {isIncome ? "+" : "-"}
                  {formatIDR(tx.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
