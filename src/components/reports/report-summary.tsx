import { formatIDR } from "@/lib/utils/format";
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";

function StatCard({
  icon,
  label,
  value,
  tint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft p-3.5">
      <div className={`inline-flex items-center gap-1.5 rounded-full ${tint} ${accent} px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider mb-2`}>
        {icon}
        {label}
      </div>
      <p className="text-base md:text-lg font-extrabold tabular-nums truncate">{value}</p>
    </div>
  );
}

export function ReportSummary({
  income,
  expense,
  net,
}: {
  income: number;
  expense: number;
  net: number;
}) {
  const netPositive = net >= 0;
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3">
      <StatCard
        icon={<ArrowDownCircle className="w-3 h-3" />}
        label="Masuk"
        value={formatIDR(income)}
        tint="bg-emerald-500/12"
        accent="text-emerald-700 dark:text-emerald-300"
      />
      <StatCard
        icon={<ArrowUpCircle className="w-3 h-3" />}
        label="Keluar"
        value={formatIDR(expense)}
        tint="bg-rose-500/12"
        accent="text-rose-700 dark:text-rose-300"
      />
      <div className="rounded-2xl border border-border bg-card shadow-soft p-3.5">
        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider mb-2 ${
            netPositive
              ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/12 text-rose-700 dark:text-rose-300"
          }`}
        >
          <Wallet className="w-3 h-3" />
          Net
        </div>
        <p
          className={`text-base md:text-lg font-extrabold tabular-nums truncate ${
            netPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {netPositive ? "+" : ""}
          {formatIDR(net)}
        </p>
      </div>
    </div>
  );
}
