import { formatIDR, formatIDRCompact, formatDateShort } from "@/lib/utils/format";
import type { SmartInsights } from "@/lib/utils/chart-data";
import { PiggyBank, Flame, CalendarClock, Crown, TrendingUp, TrendingDown, AlertTriangle, Zap, Gift } from "lucide-react";

function Chip({
  tone,
  icon,
  label,
  value,
  sub,
}: {
  tone: "violet" | "emerald" | "amber" | "rose" | "cyan";
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}) {
  const toneMap: Record<typeof tone, { ring: string; bg: string; text: string; icon: string }> = {
    violet: { ring: "ring-violet-500/15", bg: "bg-violet-500/10", text: "text-violet-700 dark:text-violet-300", icon: "text-violet-600 dark:text-violet-300" },
    emerald: { ring: "ring-emerald-500/15", bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-300", icon: "text-emerald-600 dark:text-emerald-300" },
    amber: { ring: "ring-amber-500/15", bg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-300", icon: "text-amber-600 dark:text-amber-300" },
    rose: { ring: "ring-rose-500/15", bg: "bg-rose-500/10", text: "text-rose-700 dark:text-rose-300", icon: "text-rose-600 dark:text-rose-300" },
    cyan: { ring: "ring-cyan-500/15", bg: "bg-cyan-500/10", text: "text-cyan-700 dark:text-cyan-300", icon: "text-cyan-600 dark:text-cyan-300" },
  };
  const t = toneMap[tone];
  return (
    <div className={`shrink-0 snap-start w-[170px] md:w-[180px] rounded-2xl border border-border bg-card p-3.5 md:p-4 ring-1 ${t.ring} shadow-soft`}>
      <div className="flex items-center gap-2">
        <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${t.bg} ${t.icon}`}>
          {icon}
        </span>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold truncate">{label}</p>
      </div>
      <p className="mt-3 font-bold text-base tabular-nums truncate">{value}</p>
      {sub && <p className={`mt-1 text-[11px] ${t.text} truncate`}>{sub}</p>}
    </div>
  );
}

export function InsightsStrip({ insights }: { insights: SmartInsights }) {
  const { savingsRate, expenseDeltaPct, projectedMonthExpense, topCategory, biggestDay, daysLeftInMonth, anomaly, categorySurge, thrBonus } = insights;

  const savingsTone = savingsRate >= 20 ? "emerald" : savingsRate >= 0 ? "amber" : "rose";
  const deltaTone = expenseDeltaPct === null
    ? "violet"
    : expenseDeltaPct <= 0
      ? "emerald"
      : expenseDeltaPct < 20
        ? "amber"
        : "rose";

  return (
    <section aria-label="Insight cepat">
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Smart Insights</h2>
        <span className="text-[11px] text-muted-foreground">otomatis dari data lo</span>
      </div>
      <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto snap-x snap-mandatory">
        <div className="flex gap-3 pb-1">
          <Chip
            tone={savingsTone}
            icon={<PiggyBank className="w-4 h-4" />}
            label="Savings rate"
            value={`${savingsRate.toFixed(0)}%`}
            sub={savingsRate >= 20 ? "Sehat 💪" : savingsRate >= 0 ? "Bisa ditingkatkan" : "Defisit bulan ini"}
          />
          <Chip
            tone={deltaTone}
            icon={expenseDeltaPct !== null && expenseDeltaPct > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            label="Pengeluaran vs bln lalu"
            value={
              expenseDeltaPct === null
                ? "—"
                : `${expenseDeltaPct >= 0 ? "+" : ""}${expenseDeltaPct.toFixed(0)}%`
            }
            sub={expenseDeltaPct === null ? "Belum ada data" : expenseDeltaPct <= 0 ? "Lebih hemat 🎉" : "Lebih boros"}
          />
          <Chip
            tone="violet"
            icon={<CalendarClock className="w-4 h-4" />}
            label="Proyeksi bulan ini"
            value={formatIDR(projectedMonthExpense)}
            sub={`${daysLeftInMonth} hari tersisa`}
          />
          {topCategory && (
            <Chip
              tone="amber"
              icon={<Crown className="w-4 h-4" />}
              label="Kategori top"
              value={
                <span className="flex items-center gap-1.5">
                  <span>{topCategory.icon}</span>
                  <span className="truncate">{topCategory.name}</span>
                </span>
              }
              sub={formatIDRCompact(topCategory.value)}
            />
          )}
          {biggestDay && (
            <Chip
              tone="rose"
              icon={<Flame className="w-4 h-4" />}
              label="Hari paling boros"
              value={formatIDRCompact(biggestDay.total)}
              sub={formatDateShort(biggestDay.date)}
            />
          )}
          {anomaly && (
            <Chip
              tone="rose"
              icon={<AlertTriangle className="w-4 h-4" />}
              label="Anomali pengeluaran"
              value={formatIDRCompact(anomaly.total)}
              sub={`${anomaly.ratio.toFixed(1)}× median · ${formatDateShort(anomaly.date)}`}
            />
          )}
          {categorySurge && (
            <Chip
              tone="amber"
              icon={<Zap className="w-4 h-4" />}
              label={`${categorySurge.icon} ${categorySurge.name} lonjak`}
              value={`+${categorySurge.deltaPct.toFixed(0)}%`}
              sub={`${formatIDRCompact(categorySurge.currentWeek)} (vs ${formatIDRCompact(categorySurge.prevWeek)})`}
            />
          )}
          {thrBonus && (
            <Chip
              tone="emerald"
              icon={<Gift className="w-4 h-4" />}
              label={`THR/Bonus ${thrBonus.monthLabel}`}
              value={formatIDR(thrBonus.amount)}
              sub={`${thrBonus.ratio.toFixed(1)}× rata-rata · split ke Goal Lebaran?`}
            />
          )}
        </div>
      </div>
    </section>
  );
}
