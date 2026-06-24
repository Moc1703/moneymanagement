import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";
import { BudgetProgressBar } from "@/components/budgets/budget-progress-bar";
import type { BudgetProgress, Category } from "@/lib/types";

type Props = {
  budgets: BudgetProgress[];
  categoryMap: Map<string, Category>;
};

export function BudgetsOverview({ budgets, categoryMap }: Props) {
  if (budgets.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <div className="px-5 pt-5 pb-2 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Kantong</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Budget bulanan</p>
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="rounded-2xl border border-dashed border-border bg-card/40 px-4 py-5 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary mb-2">
              <Wallet className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium">Belum ada budget</p>
            <p className="text-xs text-muted-foreground mt-1">Set limit kategori biar pengeluaran terkontrol.</p>
            <Link
              href="/settings/budgets"
              className="mt-3 inline-flex items-center gap-1 rounded-full gradient-brand text-white px-3 py-1.5 text-xs font-medium"
            >
              Set Kantong
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Sort: over-budget first, then highest % utilization
  const sorted = [...budgets]
    .map((b) => ({
      ...b,
      pct: Number(b.amount) > 0 ? Number(b.spent) / Number(b.amount) : 0,
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h3 className="text-base font-semibold">Kantong</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Top {sorted.length} kategori bulan ini</p>
        </div>
        <Link
          href="/settings/budgets"
          className="inline-flex items-center gap-1 rounded-full bg-muted/60 hover:bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors"
        >
          Atur
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <ul className="px-5 pb-5 space-y-3">
        {sorted.map((b) => {
          const cat = categoryMap.get(b.category_id);
          if (!cat) return null;
          return (
            <li key={b.budget_id} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-lg text-sm shrink-0"
                  style={{ backgroundColor: `${cat.color}1A`, color: cat.color }}
                >
                  {cat.icon}
                </span>
                <span className="text-sm font-medium truncate">{cat.name}</span>
              </div>
              <BudgetProgressBar spent={Number(b.spent)} amount={Number(b.amount)} color={cat.color} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
