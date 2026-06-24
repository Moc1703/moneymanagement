"use client";

import { useState } from "react";
import { formatIDR, formatIDRCompact } from "@/lib/utils/format";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type DataPoint = { period: string; label: string; income: number; expense: number };

const INCOME_COLOR = "oklch(0.70 0.16 165)";
const EXPENSE_COLOR = "oklch(0.66 0.22 22)";

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number; dataKey?: string; color?: string }[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-soft text-xs">
      <p className="font-medium mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-muted-foreground">{p.name}</span>
          </span>
          <span className="font-semibold tabular-nums">{formatIDR(Number(p.value))}</span>
        </div>
      ))}
    </div>
  );
}

export function CashflowChart({ data }: { data: DataPoint[] }) {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const totalIncome = data.reduce((s, d) => s + d.income, 0);
  const totalExpense = data.reduce((s, d) => s + d.expense, 0);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <div className="px-5 pt-5 pb-2 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Arus Kas</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {period === "week" ? "8 minggu terakhir" : "6 bulan terakhir"}
          </p>
        </div>
        <div className="inline-flex rounded-full border border-border bg-muted/50 p-0.5 text-[11px]">
          <button
            onClick={() => setPeriod("week")}
            className={`min-h-8 px-3 py-1 rounded-full font-medium transition-colors ${
              period === "week" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            8 Mgg
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`min-h-8 px-3 py-1 rounded-full font-medium transition-colors ${
              period === "month" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            6 Bln
          </button>
        </div>
      </div>

      <div className="px-5 pb-2 flex items-center gap-3 text-[11px]">
        <span className="inline-flex items-center gap-1.5">
          <ArrowDownRight className="w-3 h-3" style={{ color: INCOME_COLOR }} />
          <span className="text-muted-foreground">Masuk</span>
          <span className="font-semibold tabular-nums">{formatIDRCompact(totalIncome)}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ArrowUpRight className="w-3 h-3" style={{ color: EXPENSE_COLOR }} />
          <span className="text-muted-foreground">Keluar</span>
          <span className="font-semibold tabular-nums">{formatIDRCompact(totalExpense)}</span>
        </span>
      </div>

      <div className="h-60 px-2 pb-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cf-income" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={INCOME_COLOR} stopOpacity={0.45} />
                <stop offset="100%" stopColor={INCOME_COLOR} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="cf-expense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={EXPENSE_COLOR} stopOpacity={0.40} />
                <stop offset="100%" stopColor={EXPENSE_COLOR} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 4" stroke="oklch(0.55 0.05 285 / 0.10)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "oklch(0.5 0.02 285)" }}
              axisLine={false}
              tickLine={false}
              dy={4}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "oklch(0.5 0.02 285)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatIDRCompact(v)}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "oklch(0.55 0.22 285 / 0.4)", strokeDasharray: "3 3" }} />
            <Area
              type="monotone"
              dataKey="income"
              name="Pemasukan"
              stroke={INCOME_COLOR}
              strokeWidth={2.5}
              fill="url(#cf-income)"
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="expense"
              name="Pengeluaran"
              stroke={EXPENSE_COLOR}
              strokeWidth={2.5}
              fill="url(#cf-expense)"
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
