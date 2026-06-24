import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  icon?: ReactNode;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
  variant?: "card" | "inline";
};

export function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  ctaHref,
  className,
  variant = "card",
}: Props) {
  const wrapper =
    variant === "card"
      ? "rounded-2xl border border-dashed border-border bg-card/40 px-6 py-8"
      : "px-2 py-6";

  return (
    <div className={cn("text-center flex flex-col items-center gap-2", wrapper, className)}>
      {icon && (
        <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-1">
          {icon}
        </span>
      )}
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="text-xs text-muted-foreground max-w-xs">{description}</p>}
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-medium shadow-soft hover:bg-primary/90 transition-colors min-h-9"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
