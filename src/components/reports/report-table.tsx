import { formatIDR, formatDate } from "@/lib/utils/format";
import type { TransactionWithRelations } from "@/lib/types";
import { Receipt } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export function ReportTable({ transactions }: { transactions: TransactionWithRelations[] }) {
  return (
    <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-baseline justify-between">
        <div>
          <h3 className="text-base font-extrabold tracking-tight">Detail Transaksi</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {transactions.length} transaksi
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="px-4 pb-5">
          <EmptyState
            icon={<Receipt className="w-5 h-5" />}
            title="Tidak ada transaksi"
            description="Ubah filter di atas atau catat transaksi baru biar laporannya jalan."
            ctaLabel="Catat transaksi"
            ctaHref="/input"
            variant="inline"
          />
        </div>
      ) : (
        <ul className="divide-y divide-border/70 px-2 pb-2">
          {transactions.map((tx) => {
            const isIncome = tx.type === "income";
            const accent = tx.category?.color ?? "oklch(0.55 0.21 260)";
            return (
              <li key={tx.id} className="px-3 py-2.5 flex items-center gap-3">
                <span
                  className="flex items-center justify-center w-10 h-10 rounded-xl text-lg shrink-0 ring-1 ring-inset"
                  style={{
                    backgroundColor: `${accent}1A`,
                    color: accent,
                    boxShadow: `inset 0 0 0 1px ${accent}26`,
                  }}
                >
                  {tx.category?.icon ?? "•"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {tx.description || tx.category?.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 flex-wrap">
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
                        <span className="inline-flex items-center gap-1">
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
                <p
                  className={`font-bold text-sm tabular-nums shrink-0 ${
                    isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                  }`}
                >
                  {isIncome ? "+" : "-"}
                  {formatIDR(tx.amount)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
