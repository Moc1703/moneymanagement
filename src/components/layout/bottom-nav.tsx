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
  { href: "/settings", label: "Lainnya", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="grid grid-cols-5 h-[68px] max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center"
                aria-label={item.label}
              >
                <span className="flex items-center justify-center w-16 h-16 -mt-7 rounded-full gradient-positive text-white shadow-soft-lg ring-[6px] ring-background transition-transform active:scale-95">
                  <Icon className="w-7 h-7" strokeWidth={2.5} />
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
