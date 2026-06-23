import { formatIDR } from "@/lib/utils/format";
import { Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";

type Props = {
  balance: number;
  monthIncome: number;
  monthExpense: number;
};

export function TotalBalanceCard({ balance, monthIncome, monthExpense }: Props) {
  const isNegative = balance < 0;
  const net = monthIncome - monthExpense;
  return (
    <div className="relative overflow-hidden rounded-3xl gradient-brand text-white shadow-glow">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/15 blur-2xl animate-orb"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 -bottom-20 w-48 h-48 rounded-full bg-cyan-300/30 blur-2xl animate-orb"
        style={{ animationDelay: "-6s" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(255,255,255,0.18),transparent)]"
      />

      <div className="relative p-6 md:p-7">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase">
            <Sparkles className="w-3 h-3" />
            Total Saldo
          </span>
          <span className="text-[11px] text-white/70 font-medium">Real-time</span>
        </div>

        <p
          className={`mt-4 text-[2rem] md:text-4xl font-bold tracking-tight tabular-nums ${
            isNegative ? "text-rose-200" : ""
          }`}
        >
          {formatIDR(balance)}
        </p>
        <p className="mt-1 text-xs text-white/70">3 rekening · sinkron tiap device</p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-white/80">
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-200" />
              Masuk bulan ini
            </div>
            <p className="mt-1 font-semibold tabular-nums">{formatIDR(monthIncome)}</p>
          </div>
          <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-white/80">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-200" />
              Keluar bulan ini
            </div>
            <p className="mt-1 font-semibold tabular-nums">{formatIDR(monthExpense)}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-white/70">
          <span>Net bulan ini</span>
          <span className={`font-semibold ${net >= 0 ? "text-emerald-200" : "text-rose-200"}`}>
            {net >= 0 ? "+" : ""}
            {formatIDR(net)}
          </span>
        </div>
      </div>
    </div>
  );
}
