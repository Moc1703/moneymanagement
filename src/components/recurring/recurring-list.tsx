"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Power, Trash2, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { toggleRecurringRule, deleteRecurringRule } from "@/actions/recurring";
import { formatIDR, formatDateShort } from "@/lib/utils/format";
import type { RecurringRule, Account, Category, Frequency } from "@/lib/types";

const FREQ_LABEL: Record<Frequency, string> = {
  weekly: "Mingguan",
  biweekly: "2 mingguan",
  monthly: "Bulanan",
  yearly: "Tahunan",
};

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function ruleSchedule(r: RecurringRule): string {
  if (r.frequency === "monthly" && r.day_of_month) return `Tiap tanggal ${r.day_of_month}`;
  if ((r.frequency === "weekly" || r.frequency === "biweekly") && r.day_of_week !== null && r.day_of_week !== undefined) {
    return `${FREQ_LABEL[r.frequency]} · ${DAYS[r.day_of_week]}`;
  }
  if (r.frequency === "yearly") return `Tahunan · ${formatDateShort(r.start_date)}`;
  return FREQ_LABEL[r.frequency];
}

export function RecurringList({
  rules,
  accounts,
  categories,
}: {
  rules: RecurringRule[];
  accounts: Account[];
  categories: Category[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  function toggle(id: string, active: boolean) {
    startTransition(async () => {
      const result = await toggleRecurringRule(id, !active);
      if (result.error) toast.error(result.error);
      else {
        toast.success(active ? "Aturan di-pause" : "Aturan aktif");
        router.refresh();
      }
    });
  }

  function handleDelete(id: string) {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        const result = await deleteRecurringRule(id);
        if (result.error) toast.error(result.error);
        else {
          toast.success("Aturan dihapus");
          router.refresh();
        }
        resolve();
      });
    });
  }

  if (rules.length === 0) {
    return (
      <EmptyState
        icon={<Repeat className="w-5 h-5" />}
        title="Belum ada aturan berulang"
        description="Setup sekali — Gaji, KPR, langganan Netflix — app auto-input tiap periode."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {rules.map((r) => {
        const cat = categoryMap.get(r.category_id);
        const acc = accountMap.get(r.account_id);
        const isIncome = r.type === "income";
        return (
          <li
            key={r.id}
            className={`rounded-2xl border bg-card p-4 shadow-soft transition-shadow hover:shadow-soft-lg ${
              r.active ? "border-border" : "border-border opacity-60"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className="flex items-center justify-center w-10 h-10 rounded-xl text-lg shrink-0 ring-1 ring-inset"
                style={{
                  backgroundColor: `${cat?.color ?? "#7c3aed"}1A`,
                  color: cat?.color ?? "#7c3aed",
                  boxShadow: `inset 0 0 0 1px ${cat?.color ?? "#7c3aed"}33`,
                }}
              >
                {cat?.icon ?? "🔁"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">
                    {r.description || cat?.name || "Tanpa nama"}
                  </p>
                  {!r.active && (
                    <span className="text-[10px] uppercase tracking-wide bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-semibold">
                      Pause
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {ruleSchedule(r)} · {acc?.name?.replace("Rekening ", "") ?? "?"}
                </p>
              </div>
              <p
                className={`text-sm font-semibold tabular-nums shrink-0 ${
                  isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                }`}
              >
                {isIncome ? "+" : "-"}
                {formatIDR(r.amount)}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggle(r.id, r.active)}
                disabled={isPending}
                className="shrink-0 text-muted-foreground min-w-11 min-h-11"
                aria-label={r.active ? "Pause" : "Aktifkan"}
                title={r.active ? "Pause" : "Aktifkan"}
              >
                <Power className="w-4 h-4" />
              </Button>
              <ConfirmDialog
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-rose-600 min-w-11 min-h-11"
                    aria-label="Hapus aturan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                }
                title="Hapus aturan berulang?"
                description="Transaksi yang sudah ter-generate gak ke-hapus — cuma aturan-nya yang berhenti."
                confirmLabel="Hapus"
                onConfirm={() => handleDelete(r.id)}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
