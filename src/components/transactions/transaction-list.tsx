"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatIDR, formatDateShort } from "@/lib/utils/format";
import { deleteTransaction } from "@/actions/transactions";
import type { TransactionWithRelations } from "@/lib/types";

export function TransactionList({
  transactions,
  compact = false,
}: {
  transactions: TransactionWithRelations[];
  compact?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
        Belum ada transaksi
      </div>
    );
  }

  function handleDelete(id: string, desc: string) {
    if (!confirm(`Hapus transaksi "${desc}"?`)) return;
    startTransition(async () => {
      const result = await deleteTransaction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Transaksi dihapus");
        router.refresh();
      }
    });
  }

  return (
    <ul className={compact ? "divide-y divide-border/70" : "space-y-2"}>
      {transactions.map((tx) => {
        const isIncome = tx.type === "income";
        const accentColor = tx.category?.color ?? "oklch(0.55 0.22 285)";
        const item = (
          <div className="flex items-center gap-3">
            <div
              className="relative flex items-center justify-center w-10 h-10 rounded-xl text-lg shrink-0 ring-1 ring-inset"
              style={{
                backgroundColor: `${accentColor}1A`,
                color: accentColor,
                boxShadow: `inset 0 0 0 1px ${accentColor}26`,
              }}
            >
              {tx.category?.icon ?? "•"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {tx.description || tx.category?.name}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 flex-wrap">
                <span className="truncate">{tx.account?.name?.replace("Rekening ", "") ?? "-"}</span>
                {tx.project && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: tx.project.color }}
                      />
                      <span className="truncate">{tx.project.name}</span>
                    </span>
                  </>
                )}
                <span>·</span>
                <span>{formatDateShort(tx.date)}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p
                className={`font-semibold text-sm tabular-nums ${
                  isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                }`}
              >
                {isIncome ? "+" : "-"}
                {formatIDR(tx.amount)}
              </p>
            </div>
            {!compact && !tx.transfer_group_id && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  handleDelete(tx.id, tx.description || tx.category?.name || "ini")
                }
                disabled={isPending}
                className="shrink-0 text-muted-foreground hover:text-rose-600"
                aria-label="Hapus"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
        return compact ? (
          <li key={tx.id} className="px-2 py-2.5 first:pt-3 last:pb-1">
            {item}
          </li>
        ) : (
          <li
            key={tx.id}
            className="rounded-2xl border border-border bg-card shadow-soft p-3 transition-shadow hover:shadow-soft-lg"
          >
            {item}
          </li>
        );
      })}
    </ul>
  );
}
