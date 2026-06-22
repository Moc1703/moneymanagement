"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatIDR, formatDate } from "@/lib/utils/format";
import { deleteTransfer } from "@/actions/transfers";
import type { TransactionWithRelations } from "@/lib/types";

type TransferGroup = {
  groupId: string;
  transactions: TransactionWithRelations[];
};

export function TransferList({ transfers }: { transfers: TransferGroup[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (transfers.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-slate-500 text-sm">
          Belum ada transfer
        </CardContent>
      </Card>
    );
  }

  function handleDelete(groupId: string) {
    if (!confirm("Hapus transfer ini? Saldo kedua rekening akan dikembalikan.")) return;
    startTransition(async () => {
      const result = await deleteTransfer(groupId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Transfer dihapus");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      {transfers.map(({ groupId, transactions }) => {
        const expense = transactions.find((t) => t.type === "expense");
        const income = transactions.find((t) => t.type === "income");
        if (!expense || !income) return null;
        const tx = expense;

        return (
          <Card key={groupId}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 shrink-0">
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {expense.account?.icon} {expense.account?.name?.replace("Rekening ", "")}
                    <ArrowRight className="w-3 h-3 inline mx-1 text-slate-400" />
                    {income.account?.icon} {income.account?.name?.replace("Rekening ", "")}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatDate(tx.date)}
                    {tx.description ? ` · ${tx.description}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-sm">{formatIDR(tx.amount)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(groupId)}
                  disabled={isPending}
                  className="shrink-0 text-slate-400 hover:text-red-600"
                  aria-label="Hapus transfer"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
