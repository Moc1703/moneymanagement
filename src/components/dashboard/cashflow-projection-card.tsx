"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { Telescope } from "lucide-react";
import { formatIDR, formatIDRCompact } from "@/lib/utils/format";
import type { ProjectionPoint } from "@/lib/utils/cashflow-projection";

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value?: number; payload?: ProjectionPoint }[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  if (!p) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-soft text-xs">
      <p className="font-medium mb-1">{label}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Proyeksi saldo</span>
        <span className="font-semibold tabular-nums">{formatIDR(p.balance)}</span>
      </div>
      {(p.income > 0 || p.expense > 0) && (
        <>
          <div className="flex items-center justify-between gap-4 mt-0.5">
            <span className="text-muted-foreground">+ Income</span>
            <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">{formatIDRCompact(p.income)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">− Expense</span>
            <span className="text-rose-600 dark:text-rose-400 tabular-nums">{formatIDRCompact(p.expense)}</span>
          </div>
        </>
      )}
    </div>
  );
}

export function CashflowProjectionCard({ data }: { data: ProjectionPoint[] }) {
  if (data.length <= 1) return null;
  const start = data[0].balance;
  const end = data[data.length - 1].balance;
  const delta = end - start;
  const min = Math.min(...data.map((d) => d.balance));
  const positive = delta >= 0;
  const lowBalanceRisk = min < 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 text-primary">
            <Telescope className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-base font-semibold">Proyeksi 12 Bulan</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Berdasarkan saldo + transaksi berulang aktif
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-3 flex flex-wrap gap-2 text-[11px]">
        <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-1">
          <span className="text-muted-foreground">Sekarang</span>
          <span className="font-semibold tabular-nums">{formatIDRCompact(start)}</span>
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-1">
          <span className="text-muted-foreground">12 bln</span>
          <span className="font-semibold tabular-nums">{formatIDRCompact(end)}</span>
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold ${
            positive
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
          }`}
        >
          {positive ? "+" : ""}
          {formatIDRCompact(delta)}
        </span>
        {lowBalanceRisk && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 px-2 py-1 font-semibold">
            ⚠️ Saldo bisa minus
          </span>
        )}
      </div>

      <div className="h-60 px-2 pb-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="proj-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.62 0.22 285)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="oklch(0.62 0.22 285)" stopOpacity={0.02} />
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
              width={55}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "oklch(0.55 0.22 285 / 0.4)", strokeDasharray: "3 3" }} />
            <ReferenceLine y={0} stroke="oklch(0.65 0.22 25)" strokeDasharray="4 4" strokeWidth={1} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="oklch(0.62 0.22 285)"
              strokeWidth={2.5}
              fill="url(#proj-fill)"
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
