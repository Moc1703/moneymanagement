import { formatIDRCompact } from "@/lib/utils/format";

type Props = {
  spent: number;
  amount: number;
  color?: string;
  showLabels?: boolean;
};

export function BudgetProgressBar({ spent, amount, color = "oklch(0.55 0.22 285)", showLabels = true }: Props) {
  const pct = amount > 0 ? (spent / amount) * 100 : 0;
  const clamped = Math.min(pct, 100);
  const tone: "ok" | "warn" | "over" = pct >= 100 ? "over" : pct >= 80 ? "warn" : "ok";
  const barColor =
    tone === "over"
      ? "oklch(0.65 0.22 25)"
      : tone === "warn"
        ? "oklch(0.78 0.16 75)"
        : color;
  const remaining = amount - spent;

  return (
    <div className="space-y-1.5">
      {showLabels && (
        <div className="flex items-center justify-between text-xs">
          <span className="tabular-nums text-muted-foreground">
            {formatIDRCompact(spent)} / {formatIDRCompact(amount)}
          </span>
          <span
            className={`font-semibold tabular-nums ${
              tone === "over"
                ? "text-rose-600 dark:text-rose-300"
                : tone === "warn"
                  ? "text-amber-600 dark:text-amber-300"
                  : "text-emerald-600 dark:text-emerald-300"
            }`}
          >
            {tone === "over"
              ? `${formatIDRCompact(Math.abs(remaining))} lewat`
              : `Sisa ${formatIDRCompact(remaining)}`}
          </span>
        </div>
      )}
      <div className="h-2 rounded-full bg-muted overflow-hidden relative">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all"
          style={{ width: `${clamped}%`, backgroundColor: barColor }}
        />
        {tone === "over" && (
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 w-1 bg-rose-700/60 rounded-r-full"
          />
        )}
      </div>
    </div>
  );
}
