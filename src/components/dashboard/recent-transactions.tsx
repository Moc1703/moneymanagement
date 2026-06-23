import Link from "next/link";
import { TransactionList } from "@/components/transactions/transaction-list";
import type { TransactionWithRelations } from "@/lib/types";
import { ArrowRight } from "lucide-react";

export function RecentTransactions({ transactions }: { transactions: TransactionWithRelations[] }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <h3 className="text-sm font-semibold">Transaksi Terbaru</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Sinkron otomatis</p>
        </div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1 rounded-full bg-muted/60 hover:bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors"
        >
          Semua
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="px-2 pb-3">
        <TransactionList transactions={transactions} compact />
      </div>
    </div>
  );
}
