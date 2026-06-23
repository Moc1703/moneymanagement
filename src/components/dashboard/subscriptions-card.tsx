import Link from "next/link";
import { Sparkles, ArrowRight, Calendar } from "lucide-react";
import { formatIDR, formatDateShort } from "@/lib/utils/format";
import type { DetectedSubscription } from "@/lib/types";

const CADENCE_LABEL: Record<number, string> = {
  7: "/minggu",
  14: "/2 minggu",
  30: "/bulan",
  91: "/3 bulan",
  365: "/tahun",
};

export function SubscriptionsCard({ subs }: { subs: DetectedSubscription[] }) {
  if (subs.length === 0) return null;

  const total = subs.reduce(
    (s, sub) => s + Number(sub.expected_amount) * (30 / sub.interval_days),
    0,
  );
  const top = subs.slice(0, 4);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold">Langganan Terdeteksi</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {subs.length} item · ≈ {formatIDR(total)}/bulan
            </p>
          </div>
        </div>
        <Link
          href="/settings/subscriptions"
          className="inline-flex items-center gap-1 rounded-full bg-muted/60 hover:bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors"
        >
          Semua
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <ul className="px-4 pb-4 space-y-2">
        {top.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-3 rounded-xl bg-muted/30 px-3 py-2.5"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{s.display_name}</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {s.next_expected_date ? `Berikut ${formatDateShort(s.next_expected_date)}` : "Tanpa estimasi"}
                <span>·</span>
                <span>{s.occurrences}× terdeteksi</span>
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold tabular-nums">
                {formatIDR(s.expected_amount)}
              </p>
              <p className="text-[10px] text-muted-foreground">{CADENCE_LABEL[s.interval_days] ?? ""}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
