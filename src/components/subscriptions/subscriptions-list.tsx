"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, RotateCcw, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dismissSubscription, undismissSubscription } from "@/actions/subscriptions";
import { formatIDR, formatDateShort } from "@/lib/utils/format";
import type { DetectedSubscription } from "@/lib/types";

const CADENCE_LABEL: Record<number, string> = {
  7: "Mingguan",
  14: "2 Mingguan",
  30: "Bulanan",
  91: "3-Bulanan",
  365: "Tahunan",
};

export function SubscriptionsList({
  subs,
  dismissed = false,
}: {
  subs: DetectedSubscription[];
  dismissed?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleAction(id: string, action: "dismiss" | "undismiss") {
    startTransition(async () => {
      const fn = action === "dismiss" ? dismissSubscription : undismissSubscription;
      const result = await fn(id);
      if (result.error) toast.error(result.error);
      else {
        toast.success(action === "dismiss" ? "Diabaikan" : "Dikembalikan");
        router.refresh();
      }
    });
  }

  return (
    <ul className="space-y-2">
      {subs.map((s) => {
        const stable = Number(s.amount_stddev_pct) <= 5;
        return (
          <li
            key={s.id}
            className={`rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow ${
              dismissed ? "opacity-60" : "hover:shadow-soft-lg"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0 font-bold">
                {s.display_name.slice(0, 1).toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm truncate">{s.display_name}</p>
                  <span className="text-[10px] uppercase tracking-wide bg-primary/10 text-primary rounded-full px-2 py-0.5 font-semibold">
                    {CADENCE_LABEL[s.interval_days] ?? `${s.interval_days}h`}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wide rounded-full px-2 py-0.5 font-semibold inline-flex items-center gap-0.5 ${
                      s.confidence >= 0.8
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {Math.round(Number(s.confidence) * 100)}% yakin
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {s.occurrences}× terdeteksi sejak {formatDateShort(s.first_seen_date)}
                  {s.next_expected_date && ` · berikut ${formatDateShort(s.next_expected_date)}`}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    {stable ? (
                      <TrendingDown className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <TrendingUp className="w-3 h-3 text-amber-500" />
                    )}
                    Stddev {Number(s.amount_stddev_pct).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold tabular-nums">{formatIDR(s.expected_amount)}</p>
                <p className="text-[10px] text-muted-foreground">rata-rata</p>
              </div>
              {dismissed ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleAction(s.id, "undismiss")}
                  disabled={isPending}
                  className="shrink-0 text-muted-foreground min-w-9 min-h-9"
                  aria-label="Kembalikan"
                  title="Kembalikan"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleAction(s.id, "dismiss")}
                  disabled={isPending}
                  className="shrink-0 text-muted-foreground hover:text-rose-600 min-w-9 min-h-9"
                  aria-label="Abaikan"
                  title="Abaikan"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
