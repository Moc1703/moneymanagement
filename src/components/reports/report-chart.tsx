"use client";

import { formatIDRCompact, formatIDR } from "@/lib/utils/format";
import { format, parseISO } from "date-fns";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { TransactionWithRelations } from "@/lib/types";

const INCOME_COLOR = "oklch(0.70 0.16 165)";
const EXPENSE_COLOR = "oklch(0.66 0.22 22)";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; dataKey?: string; color?: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-soft text-xs">
      <p className="font-semibold mb-1.5">{label}</p>
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

export function ReportChart({ transactions }: { transactions: TransactionWithRelations[] }) {
  const dailyMap = new Map<string, { income: number; expense: number }>();
  for (const tx of transactions) {
    if (!dailyMap.has(tx.date)) dailyMap.set(tx.date, { income: 0, expense: 0 });
    const entry = dailyMap.get(tx.date)!;
    if (tx.type === "income") entry.income += Number(tx.amount);
    else entry.expense += Number(tx.amount);
  }
  const data = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { income, expense }]) => ({
      date,
      label: format(parseISO(date), "d MMM"),
      income,
      expense,
    }));

  return (
    <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden">
      <div className="px-5 pt-5 pb-2">
        <h3 className="text-base font-extrabold tracking-tight">Tren Harian</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">Pemasukan vs Pengeluaran per hari</p>
      </div>

      <div className="px-5 pb-2 flex items-center gap-3 text-[11px]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: INCOME_COLOR }} />
          <span className="text-muted-foreground font-medium">Masuk</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: EXPENSE_COLOR }} />
          <span className="text-muted-foreground font-medium">Keluar</span>
        </span>
      </div>

      {data.length === 0 ? (
        <div className="px-5 pb-5 pt-2 text-center">
          <p className="text-sm text-muted-foreground py-6">Tidak ada data untuk periode ini</p>
        </div>
      ) : (
        <div className="h-60 px-2 pb-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rep-income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={INCOME_COLOR} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={INCOME_COLOR} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="rep-expense" x1="0" y1="0" x2="0" y2="1">
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
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "oklch(0.55 0.22 285 / 0.4)", strokeDasharray: "3 3" }}
              />
              <Area
                type="monotone"
                dataKey="income"
                name="Pemasukan"
                stroke={INCOME_COLOR}
                strokeWidth={2.5}
                fill="url(#rep-income)"
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Pengeluaran"
                stroke={EXPENSE_COLOR}
                strokeWidth={2.5}
                fill="url(#rep-expense)"
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
