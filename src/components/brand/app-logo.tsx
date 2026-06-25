import { cn } from "@/lib/utils";

// Brand monogram: "M" peak + emerald growth-dot accent on gradient bg.
// One SVG, scales to any size via the `size` prop.
export function AppLogo({
  size = 40,
  className,
  rounded = "rounded-2xl",
}: {
  size?: number;
  className?: string;
  rounded?: string;
}) {
  const id = `logo-grad-${size}`;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-hidden",
        rounded,
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 40 40" width={size} height={size} className="block">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.55 0.21 260)" />
            <stop offset="100%" stopColor="oklch(0.60 0.22 305)" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill={`url(#${id})`} />
        {/* M monogram — two angled strokes forming a peak */}
        <path
          d="M 10 29 L 10 12 L 20 22 L 30 12 L 30 29"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Positive growth accent — emerald dot top-right */}
        <circle cx="31.5" cy="10.5" r="4" fill="oklch(0.70 0.16 165)" stroke="white" strokeWidth="1.6" />
      </svg>
    </span>
  );
}

export function AppLogoLockup({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: { logo: 32, name: "text-base", tag: "text-[10px]" },
    md: { logo: 40, name: "text-lg", tag: "text-[11px]" },
    lg: { logo: 56, name: "text-2xl", tag: "text-xs" },
  } as const;
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <AppLogo size={s.logo} />
      <div className="leading-tight">
        <span className={cn("block font-extrabold tracking-tight", s.name)}>
          Money<span className="text-primary">.</span>Mgmt
        </span>
        <span className={cn("block text-muted-foreground font-medium uppercase tracking-[0.16em]", s.tag)}>
          Smart cashflow
        </span>
      </div>
    </div>
  );
}
