"use client";

import { formatIDR, formatIDRCompact } from "@/lib/utils/format";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Project = { name: string; income: number; expense: number; net: number; color: string };

const INCOME_COLOR = "oklch(0.70 0.16 165)";
const EXPENSE_COLOR = "oklch(0.66 0.22 22)";

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number; dataKey?: string; color?: string }[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-popover/95 backdrop-blur-md px-3 py-2 shadow-soft text-xs">
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

export function ProjectBarChart({ data }: { data: Project[] }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="px-4 pt-4 pb-1">
        <h3 className="text-sm font-semibold">Per Project</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">Bulan ini · Pemasukan vs Pengeluaran</p>
      </div>

      <div className="px-2 pb-3">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">Belum ada transaksi bulan ini</p>
        ) : (
          <div className="h-56 px-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="bar-income" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={INCOME_COLOR} stopOpacity={1} />
                    <stop offset="100%" stopColor={INCOME_COLOR} stopOpacity={0.55} />
                  </linearGradient>
                  <linearGradient id="bar-expense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={EXPENSE_COLOR} stopOpacity={1} />
                    <stop offset="100%" stopColor={EXPENSE_COLOR} stopOpacity={0.55} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 4" stroke="oklch(0.55 0.05 285 / 0.10)" vertical={false} />
                <XAxis
                  dataKey="name"
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
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(0.55 0.22 285 / 0.06)" }} />
                <Bar dataKey="income" name="Pemasukan" fill="url(#bar-income)" radius={[8, 8, 2, 2]} maxBarSize={28} />
                <Bar dataKey="expense" name="Pengeluaran" fill="url(#bar-expense)" radius={[8, 8, 2, 2]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
