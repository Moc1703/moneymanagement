"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, BarChart3, ArrowLeftRight, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Beranda", icon: Home },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
  { href: "/input", label: "Input", icon: Plus, primary: true },
  { href: "/transfers", label: "Transfer", icon: ArrowLeftRight },
  { href: "/settings", label: "Setting", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 md:hidden"
    >
      <div className="mx-auto max-w-lg">
        <div className="glass-nav relative grid grid-cols-5 items-center h-16 rounded-3xl border border-border shadow-soft px-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            if (item.primary) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex items-center justify-center"
                  aria-label={item.label}
                >
                  <span
                    aria-hidden
                    className="absolute -top-7 w-14 h-14 rounded-full gradient-brand blur-xl opacity-50"
                  />
                  <span className="relative flex items-center justify-center w-14 h-14 -mt-7 rounded-full gradient-brand text-white shadow-glow ring-4 ring-background">
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                  </span>
                </Link>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 h-full mx-1 rounded-2xl transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-2xl bg-primary/10"
                  />
                )}
                <Icon className={cn("relative w-5 h-5", isActive && "stroke-[2.5]")} />
                <span className="relative text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
