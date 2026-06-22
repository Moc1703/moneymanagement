import { Card, CardContent } from "@/components/ui/card";
import { formatIDR, formatIDRCompact } from "@/lib/utils/format";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { Account } from "@/lib/types";

type BalanceInfo = {
  account: Account;
  balance: number;
  monthDelta: number;
};

export function BalanceCards({ balances }: { balances: BalanceInfo[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {balances.map(({ account, balance, monthDelta }) => {
        const positive = monthDelta >= 0;
        return (
          <Card key={account.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <span
                  className="flex items-center justify-center w-9 h-9 rounded-lg text-lg shrink-0"
                  style={{ backgroundColor: `${account.color}20` }}
                >
                  {account.icon}
                </span>
                <p className="text-xs text-slate-600 font-medium truncate">{account.name}</p>
              </div>
              <p className="text-lg font-bold mt-2 truncate">{formatIDR(balance)}</p>
              <div className="flex items-center gap-1 text-xs mt-1">
                {positive ? (
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <span className={positive ? "text-emerald-600" : "text-red-600"}>
                  {positive ? "+" : ""}
                  {formatIDRCompact(monthDelta)} bulan ini
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
