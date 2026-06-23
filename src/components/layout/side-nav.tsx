"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, BarChart3, ArrowLeftRight, Settings, LogOut, Sparkles, Target, HandCoins, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Beranda", icon: Home },
  { href: "/input", label: "Input Transaksi", icon: Plus },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
  { href: "/transfers", label: "Transfer", icon: ArrowLeftRight },
  { href: "/goals", label: "Tabungan Tujuan", icon: Target },
  { href: "/debts", label: "Hutang & Piutang", icon: HandCoins },
  { href: "/networth", label: "Net Worth", icon: Scale },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:border-r md:border-sidebar-border md:bg-sidebar">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-brand text-white shadow-soft">
          <Sparkles className="w-5 h-5" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <span className="block font-bold tracking-tight">Money Mgmt</span>
          <span className="block text-[11px] text-muted-foreground">Smart cashflow</span>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-foreground/70 hover:text-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive && "stroke-[2.5]")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <form action={signOut} className="p-3 border-t border-sidebar-border">
        <button
          type="submit"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-sidebar-accent w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </form>
    </aside>
  );
}
