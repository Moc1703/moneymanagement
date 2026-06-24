import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import { GoalRing } from "@/components/goals/goal-ring";
import { formatIDR } from "@/lib/utils/format";
import type { GoalProgress } from "@/lib/types";

export function GoalsOverview({ goals }: { goals: GoalProgress[] }) {
  if (goals.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <div className="px-5 pt-5 pb-2 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Tabungan Tujuan</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Goal nabung</p>
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="rounded-2xl border border-dashed border-border bg-card/40 px-4 py-5 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary mb-2">
              <Target className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium">Belum ada goal</p>
            <p className="text-xs text-muted-foreground mt-1">DP rumah, liburan, dana darurat — set targetnya.</p>
            <Link
              href="/goals"
              className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              Bikin goal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const top = goals.slice(0, 3);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h3 className="text-base font-semibold">Tabungan Tujuan</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{goals.length} goal aktif</p>
        </div>
        <Link
          href="/goals"
          className="inline-flex items-center gap-1 rounded-full bg-muted/60 hover:bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors"
        >
          Semua
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <ul className="px-5 pb-5 space-y-3">
        {top.map((g) => {
          const current = Number(g.current_amount);
          const target = Number(g.target_amount);
          return (
            <li key={g.goal_id}>
              <Link href={`/goals/${g.goal_id}`} className="flex items-center gap-3">
                <GoalRing
                  current={current}
                  target={target}
                  color={g.color}
                  icon={g.icon}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{g.name}</p>
                  <p className="text-[11px] text-muted-foreground tabular-nums truncate">
                    {formatIDR(current)} / {formatIDR(target)}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
