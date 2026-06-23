"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { formatIDR, formatIDRCompact, formatDateShort } from "@/lib/utils/format";

export type TimelinePoint = {
  date: string;
  assets: number;
  liabilities: number;
  net: number;
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value?: number; payload?: TimelinePoint }[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  if (!p) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-soft text-xs">
      <p className="font-medium mb-1">{label && formatDateShort(label)}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Aset</span>
        <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">{formatIDRCompact(p.assets)}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Hutang</span>
        <span className="text-rose-600 dark:text-rose-400 tabular-nums">{formatIDRCompact(p.liabilities)}</span>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-border mt-1 pt-1">
        <span className="text-muted-foreground">Net worth</span>
        <span className="font-semibold tabular-nums">{formatIDR(p.net)}</span>
      </div>
    </div>
  );
}

export function NetWorthTimeline({ data }: { data: TimelinePoint[] }) {
  if (data.length < 2) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center">
        <p className="text-sm font-medium">Timeline belum siap</p>
        <p className="text-xs text-muted-foreground mt-1">
          Butuh minimal 2 snapshot. Update nilai aset/hutang lo seiring waktu — snapshot otomatis tercatat.
        </p>
      </div>
    );
  }

  return (
    <div className="h-56 px-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="nw-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.62 0.22 285)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="oklch(0.62 0.22 285)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 4" stroke="oklch(0.55 0.05 285 / 0.10)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "oklch(0.5 0.02 285)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatDateShort(v)}
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
          <Area
            type="monotone"
            dataKey="net"
            stroke="oklch(0.62 0.22 285)"
            strokeWidth={2.5}
            fill="url(#nw-fill)"
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
