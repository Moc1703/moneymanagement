import Link from "next/link";
import { TopBar } from "@/components/layout/top-bar";
import { GoalForm } from "@/components/goals/goal-form";
import { GoalRing } from "@/components/goals/goal-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { Target, Calendar, ArrowRight } from "lucide-react";
import { getGoals } from "@/actions/goals";
import { getAccounts } from "@/actions/accounts";
import { formatIDR, formatDateShort } from "@/lib/utils/format";

function monthsUntil(targetDate: string): number {
  const t = new Date(targetDate + "T00:00:00");
  const now = new Date();
  const months = (t.getFullYear() - now.getFullYear()) * 12 + (t.getMonth() - now.getMonth());
  return Math.max(months, 0);
}

export default async function GoalsPage() {
  const [goals, accounts] = await Promise.all([getGoals(), getAccounts()]);

  return (
    <>
      <TopBar title="Tabungan Tujuan" subtitle={`${goals.length} goal aktif`} />
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        {goals.length === 0 ? (
          <EmptyState
            icon={<Target className="w-5 h-5" />}
            title="Belum ada goal"
            description="Bikin target nabung — DP rumah, liburan, dana darurat. App ngitung otomatis berapa lo perlu nabung tiap bulan."
          />
        ) : (
          <ul className="space-y-3">
            {goals.map((g) => {
              const current = Number(g.current_amount);
              const target = Number(g.target_amount);
              const remaining = Math.max(target - current, 0);
              const months = g.target_date ? monthsUntil(g.target_date) : null;
              const perMonth = months !== null && months > 0 ? remaining / months : null;
              const done = current >= target;
              return (
                <li key={g.goal_id}>
                  <Link
                    href={`/goals/${g.goal_id}`}
                    className="block rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-soft-lg p-4"
                  >
                    <div className="flex items-center gap-4">
                      <GoalRing
                        current={current}
                        target={target}
                        color={g.color}
                        icon={g.icon}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">{g.name}</p>
                          {done && (
                            <span className="text-[10px] uppercase tracking-wide bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 rounded-full px-2 py-0.5 font-semibold">
                              Tercapai 🎉
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                          {formatIDR(current)} / {formatIDR(target)}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1.5">
                          {g.target_date && (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDateShort(g.target_date)}
                            </span>
                          )}
                          {perMonth !== null && !done && (
                            <span className="inline-flex items-center gap-1 text-primary font-medium">
                              Nabung {formatIDR(perMonth)}/bulan
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <GoalForm accounts={accounts} />
      </div>
    </>
  );
}
