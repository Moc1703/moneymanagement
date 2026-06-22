"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
      <Card>
        <CardContent className="p-8 text-center text-slate-500 text-sm">
          Belum ada transaksi
        </CardContent>
      </Card>
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
    <div className="space-y-2">
      {transactions.map((tx) => {
        const isIncome = tx.type === "income";
        return (
          <Card key={tx.id}>
            <CardContent className={compact ? "p-3" : "p-4"}>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg text-lg shrink-0"
                  style={{ backgroundColor: tx.category ? `${tx.category.color}30` : "#f1f5f9" }}
                >
                  {tx.category?.icon ?? "•"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {tx.description || tx.category?.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 flex-wrap">
                    <span>{tx.account?.name?.replace("Rekening ", "") ?? "-"}</span>
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
                    <span>·</span>
                    <span>{formatDateShort(tx.date)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`font-semibold text-sm ${
                      isIncome ? "text-emerald-600" : "text-slate-900"
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
                    className="shrink-0 text-slate-400 hover:text-red-600"
                    aria-label="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
