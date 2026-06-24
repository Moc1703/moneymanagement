import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // base — generous rounding, semibold, springy press, focus ring, disabled, svg sizing
  [
    "group/button relative inline-flex shrink-0 items-center justify-center",
    "rounded-2xl border border-transparent bg-clip-padding",
    "text-sm font-semibold whitespace-nowrap tracking-tight",
    "transition-[transform,background-color,box-shadow,color] duration-150",
    "outline-none select-none",
    "focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "active:not-aria-[haspopup]:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:ring-3 aria-invalid:ring-destructive/30",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "shadow-[0_1px_2px_0_oklch(0.55_0.21_260_/_0.30),0_8px_20px_-6px_oklch(0.55_0.21_260_/_0.35)]",
          "hover:bg-[color-mix(in_oklch,var(--primary),black_6%)]",
          "hover:shadow-[0_1px_2px_0_oklch(0.55_0.21_260_/_0.35),0_10px_24px_-6px_oklch(0.55_0.21_260_/_0.45)]",
        ].join(" "),
        positive: [
          "bg-emerald-600 text-white",
          "shadow-[0_1px_2px_0_oklch(0.65_0.17_165_/_0.30),0_8px_20px_-6px_oklch(0.65_0.17_165_/_0.35)]",
          "hover:bg-emerald-700",
          "hover:shadow-[0_1px_2px_0_oklch(0.65_0.17_165_/_0.35),0_10px_24px_-6px_oklch(0.65_0.17_165_/_0.45)]",
        ].join(" "),
        outline: [
          "border-border bg-card text-foreground",
          "shadow-[0_1px_2px_0_oklch(0.18_0.03_265_/_0.04)]",
          "hover:bg-muted hover:text-foreground",
          "aria-expanded:bg-muted",
          "dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        ].join(" "),
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted dark:hover:bg-muted/50",
        destructive: [
          "bg-rose-600 text-white",
          "shadow-[0_1px_2px_0_oklch(0.65_0.22_25_/_0.30),0_8px_20px_-6px_oklch(0.65_0.22_25_/_0.35)]",
          "hover:bg-rose-700",
        ].join(" "),
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-11 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-xl px-2.5 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-xl px-3 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-13 gap-2 px-6 text-[0.95rem] has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-11",
        "icon-xs":
          "size-7 rounded-xl in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-9 rounded-xl in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-13",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
