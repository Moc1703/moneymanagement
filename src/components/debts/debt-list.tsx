"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Check, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SettleDialog } from "./settle-dialog";
import { deleteDebt } from "@/actions/debts";
import { formatIDR, formatDateShort } from "@/lib/utils/format";
import type { DebtBalance } from "@/lib/types";

export function DebtList({ debts }: { debts: DebtBalance[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        const result = await deleteDebt(id);
        if (result.error) toast.error(result.error);
        else {
          toast.success("Catatan dihapus");
          router.refresh();
        }
        resolve();
      });
    });
  }

  if (debts.length === 0) {
    return (
      <EmptyState
        title="Belum ada catatan"
        description="Catat pinjaman ke teman/keluarga di sini biar gak lupa siapa pinjam apa."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {debts.map((d) => {
        const isOwe = d.direction === "owe";
        const outstanding = Number(d.outstanding);
        const principal = Number(d.principal);
        const paid = Number(d.paid);
        const settled = d.status === "settled";
        const partial = d.status === "partial";

        const dueSoon = d.due_date && !settled
          ? (new Date(d.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 7
          : false;

        return (
          <li
            key={d.debt_id}
            className={`rounded-2xl border bg-card p-4 shadow-soft transition-shadow hover:shadow-soft-lg ${
              settled ? "opacity-60 border-border" : "border-border"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 text-sm font-semibold ${
                  isOwe
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-300"
                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                }`}
              >
                {d.counterparty.slice(0, 2).toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm truncate">{d.counterparty}</p>
                  {settled && (
                    <span className="text-[10px] uppercase tracking-wide bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 rounded-full px-2 py-0.5 font-semibold">
                      Lunas
                    </span>
                  )}
                  {partial && (
                    <span className="text-[10px] uppercase tracking-wide bg-amber-500/15 text-amber-700 dark:text-amber-300 rounded-full px-2 py-0.5 font-semibold">
                      Cicilan
                    </span>
                  )}
                  {dueSoon && (
                    <span className="text-[10px] uppercase tracking-wide bg-rose-500/15 text-rose-700 dark:text-rose-300 rounded-full px-2 py-0.5 font-semibold inline-flex items-center gap-0.5">
                      <CalendarClock className="w-3 h-3" />
                      Mendesak
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isOwe ? "Saya pinjam" : "Dipinjam"} · pokok {formatIDR(principal)}
                  {paid > 0 && ` · sudah ${formatIDR(paid)}`}
                  {d.due_date && ` · jatuh tempo ${formatDateShort(d.due_date)}`}
                </p>
                {d.note && <p className="text-xs text-muted-foreground mt-1 italic">{d.note}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Sisa</p>
                <p className={`text-sm font-bold tabular-nums ${isOwe ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {formatIDR(outstanding)}
                </p>
              </div>
            </div>

            {!settled && (
              <div className="flex items-center gap-2 mt-3">
                <SettleDialog
                  debtId={d.debt_id}
                  counterparty={d.counterparty}
                  outstanding={outstanding}
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-h-9 gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {isOwe ? "Bayar" : "Terima"}
                    </Button>
                  }
                />
                <ConfirmDialog
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-rose-600 min-w-9 min-h-9"
                      aria-label="Hapus catatan"
                      disabled={isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  }
                  title="Hapus catatan?"
                  description="Riwayat pembayaran ikut hilang. Aksi ini gak bisa dibatalkan."
                  confirmLabel="Hapus"
                  onConfirm={() => handleDelete(d.debt_id)}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
