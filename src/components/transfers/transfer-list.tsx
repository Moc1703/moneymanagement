"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeftRight } from "lucide-react";
import { formatIDR, formatDate } from "@/lib/utils/format";
import { deleteTransfer } from "@/actions/transfers";
import type { TransactionWithRelations } from "@/lib/types";

type TransferGroup = {
  groupId: string;
  transactions: TransactionWithRelations[];
};

export function TransferList({ transfers }: { transfers: TransferGroup[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  if (transfers.length === 0) {
    return (
      <EmptyState
        icon={<ArrowLeftRight className="w-5 h-5" />}
        title="Belum ada transfer"
        description="Pakai form di atas buat pindahin duit antar rekening — saldo dua-duanya update bareng."
      />
    );
  }

  function handleDelete(groupId: string) {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        const result = await deleteTransfer(groupId);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Transfer dihapus");
          router.refresh();
        }
        resolve();
      });
    });
  }

  return (
    <ul className="space-y-2">
      {transfers.map(({ groupId, transactions }) => {
        const expense = transactions.find((t) => t.type === "expense");
        const income = transactions.find((t) => t.type === "income");
        if (!expense || !income) return null;
        const tx = expense;

        return (
          <li
            key={groupId}
            className="rounded-2xl border border-border bg-card shadow-soft p-3 transition-shadow hover:shadow-soft-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {expense.account?.icon} {expense.account?.name?.replace("Rekening ", "")}
                  <ArrowRight className="w-3 h-3 inline mx-1 text-muted-foreground" />
                  {income.account?.icon} {income.account?.name?.replace("Rekening ", "")}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {formatDate(tx.date)}
                  {tx.description ? ` · ${tx.description}` : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-sm tabular-nums">{formatIDR(tx.amount)}</p>
              </div>
              <ConfirmDialog
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-rose-600 min-w-11 min-h-11"
                    aria-label="Hapus transfer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                }
                title="Hapus transfer ini?"
                description={
                  <>
                    Saldo kedua rekening akan dikembalikan ({formatIDR(tx.amount)} masuk lagi ke{" "}
                    <strong>{expense.account?.name?.replace("Rekening ", "")}</strong>).
                  </>
                }
                confirmLabel="Hapus"
                onConfirm={() => handleDelete(groupId)}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
