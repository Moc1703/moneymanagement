import { formatIDR } from "@/lib/utils/format";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

type Props = {
  balance: number;
  monthIncome: number;
  monthExpense: number;
  sparkline?: number[]; // last N daily running-balance points
};

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 30;
  const step = w / (data.length - 1);
  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const areaPath = `M 0,${h} L ${points.split(" ").join(" L ")} L ${w},${h} Z`;
  const linePath = `M ${points.split(" ").join(" L ")}`;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="absolute inset-x-0 bottom-0 w-full h-24 opacity-60 pointer-events-none"
      aria-hidden
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.85 0.13 200)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="oklch(0.85 0.13 200)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#spark-fill)" />
      <path d={linePath} stroke="oklch(0.92 0.10 200)" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TotalBalanceCard({ balance, monthIncome, monthExpense, sparkline }: Props) {
  const isNegative = balance < 0;
  const net = monthIncome - monthExpense;
  const netPositive = net >= 0;
  return (
    <div className="relative overflow-hidden rounded-[28px] gradient-hero text-white shadow-hero">
      <div className="relative p-5 md:p-9">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold tracking-wide">
            Total Saldo
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/8 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/70 font-semibold">
            Real-time
          </span>
        </div>

        <p
          className={`mt-4 font-bold tabular-nums tracking-tight leading-[0.95] text-[2.1rem] md:text-6xl ${
            isNegative ? "text-rose-200" : "text-white"
          }`}
        >
          {formatIDR(balance)}
        </p>
        <p className="mt-2 text-[11px] md:text-xs text-white/65">3 rekening · sinkron tiap device</p>

        {sparkline && <Sparkline data={sparkline} />}

        <div className="relative mt-6 grid grid-cols-3 gap-2 md:gap-3">
          <div className="rounded-2xl bg-white/10 border border-white/10 px-2.5 py-2 md:px-3 md:py-2.5">
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/70 font-semibold">
              <ArrowDownRight className="w-3 h-3 text-emerald-300" />
              Masuk
            </div>
            <p className="mt-1 font-semibold text-[13px] md:text-sm tabular-nums truncate">{formatIDR(monthIncome)}</p>
          </div>
          <div className="rounded-2xl bg-white/10 border border-white/10 px-2.5 py-2 md:px-3 md:py-2.5">
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/70 font-semibold">
              <ArrowUpRight className="w-3 h-3 text-rose-300" />
              Keluar
            </div>
            <p className="mt-1 font-semibold text-[13px] md:text-sm tabular-nums truncate">{formatIDR(monthExpense)}</p>
          </div>
          <div className="rounded-2xl bg-white/10 border border-white/10 px-2.5 py-2 md:px-3 md:py-2.5">
            <div className="text-[10px] uppercase tracking-wider text-white/70 font-semibold">Net</div>
            <p
              className={`mt-1 font-semibold text-[13px] md:text-sm tabular-nums truncate ${
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
