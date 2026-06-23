import { formatIDRCompact } from "@/lib/utils/format";

type Props = {
  current: number;
  target: number;
  color?: string;
  size?: "sm" | "md" | "lg";
  icon?: string;
};

const SIZES = {
  sm: { ring: 64, font: "text-[10px]", num: "text-xs" },
  md: { ring: 96, font: "text-[11px]", num: "text-sm" },
  lg: { ring: 140, font: "text-xs", num: "text-base" },
};

export function GoalRing({ current, target, color = "oklch(0.55 0.22 285)", size = "md", icon }: Props) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const deg = (pct / 100) * 360;
  const { ring, font, num } = SIZES[size];
  const inner = ring - 14;
  const done = pct >= 100;

  return (
    <div className="relative" style={{ width: ring, height: ring }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${color} ${deg}deg, oklch(0.92 0.015 285) ${deg}deg)`,
        }}
      />
      <div
        className="absolute inset-0 m-auto rounded-full bg-card flex flex-col items-center justify-center"
        style={{ width: inner, height: inner }}
      >
        {icon && <span className="text-lg leading-none mb-0.5">{icon}</span>}
        <span className={`${num} font-bold tabular-nums leading-tight`} style={{ color: done ? color : undefined }}>
          {pct.toFixed(0)}%
        </span>
        <span className={`${font} text-muted-foreground tabular-nums leading-tight`}>
          {formatIDRCompact(current)}
        </span>
      </div>
    </div>
  );
}
