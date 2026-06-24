import { formatIDR } from "@/lib/utils/format";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

type Props = {
  balance: number;
  monthIncome: number;
  monthExpense: number;
};

export function TotalBalanceCard({ balance, monthIncome, monthExpense }: Props) {
  const isNegative = balance < 0;
  const net = monthIncome - monthExpense;
  const netPositive = net >= 0;
  return (
    <div className="relative overflow-hidden rounded-[28px] gradient-brand text-white">
      <div className="p-7 md:p-9">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/70">
          Total Saldo
        </p>
        <p
          className={`mt-3 font-bold tabular-nums tracking-tight leading-[0.95] text-[2.75rem] md:text-6xl ${
            isNegative ? "text-rose-200" : ""
          }`}
        >
          {formatIDR(balance)}
        </p>
        <p className="mt-3 text-xs text-white/75">3 rekening · sinkron real-time</p>

        <div className="mt-7 flex items-center gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-white/75 uppercase tracking-wide">
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-200" />
              Masuk
            </div>
            <p className="mt-1 text-lg font-semibold tabular-nums">{formatIDR(monthIncome)}</p>
          </div>
          <div className="h-10 w-px bg-white/15" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-white/75 uppercase tracking-wide">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-200" />
              Keluar
            </div>
            <p className="mt-1 text-lg font-semibold tabular-nums">{formatIDR(monthExpense)}</p>
          </div>
          <div className="h-10 w-px bg-white/15" />
          <div className="min-w-0">
            <p className="text-[11px] text-white/75 uppercase tracking-wide">Net</p>
            <p
              className={`mt-1 text-lg font-semibold tabular-nums ${
                netPositive ? "text-emerald-200" : "text-rose-200"
              }`}
            >
              {netPositive ? "+" : ""}
              {formatIDR(net)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
