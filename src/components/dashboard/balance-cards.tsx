import { formatIDR, formatIDRCompact } from "@/lib/utils/format";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { Account } from "@/lib/types";

type BalanceInfo = {
  account: Account;
  balance: number;
  monthDelta: number;
};

export function BalanceCards({
  balances,
  layout = "auto",
}: {
  balances: BalanceInfo[];
  layout?: "auto" | "stack";
}) {
  const gridCls =
    layout === "stack"
      ? "grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 h-full"
      : "grid grid-cols-1 sm:grid-cols-3 gap-3";
  return (
    <div className={gridCls}>

      {balances.map(({ account, balance, monthDelta }) => {
        const positive = monthDelta >= 0;
        return (
          <div
            key={account.id}
            className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-shadow hover:shadow-soft-lg"
          >
            <div
              aria-hidden
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: account.color }}
            />
            <div className="p-5">
              <div className="flex items-center gap-2">
                <span
                  className="flex items-center justify-center w-10 h-10 rounded-xl text-lg shrink-0 ring-1 ring-inset"
                  style={{
                    backgroundColor: `${account.color}1F`,
                    color: account.color,
                    boxShadow: `inset 0 0 0 1px ${account.color}33`,
                  }}
                >
                  {account.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Rekening</p>
                  <p className="text-sm font-semibold truncate">{account.name.replace("Rekening ", "")}</p>
                </div>
              </div>
              <p className="text-xl font-bold mt-3 truncate tabular-nums">{formatIDR(balance)}</p>
              <div
                className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  positive
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                }`}
              >
                {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {positive ? "+" : ""}
                {formatIDRCompact(monthDelta)} bulan ini
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
