"use client";

import { formatIDR, formatIDRCompact } from "@/lib/utils/format";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

type Slice = { name: string; value: number; color: string };

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: Slice }[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const slice = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-popover/95 backdrop-blur-md px-3 py-2 shadow-soft text-xs">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: slice.color }} />
        <span className="font-medium">{slice.name}</span>
      </div>
      <span className="font-semibold tabular-nums">{formatIDR(slice.value)}</span>
    </div>
  );
}

export function CategoryPieChart({ data }: { data: Slice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="px-4 pt-4 pb-1">
        <h3 className="text-sm font-semibold">Pengeluaran per Kategori</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">Bulan ini</p>
      </div>

      <div className="px-4 pb-4">
        {data.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Belum ada pengeluaran bulan ini
          </div>
        ) : (
          <>
            <div className="relative h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={82}
                    paddingAngle={3}
                    cornerRadius={6}
                    stroke="none"
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total</p>
                <p className="text-base font-bold tabular-nums">{formatIDRCompact(total)}</p>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5">
              {data.slice(0, 5).map((slice) => {
                const pct = (slice.value / total) * 100;
                return (
                  <li key={slice.name} className="text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: slice.color }}
                        />
                        <span className="truncate font-medium">{slice.name}</span>
                      </div>
                      <span className="font-semibold tabular-nums shrink-0">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: slice.color }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
