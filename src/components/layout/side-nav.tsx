"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, BarChart3, ArrowLeftRight, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/input", label: "Input Transaksi", icon: Plus },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
  { href: "/transfers", label: "Transfer", icon: ArrowLeftRight },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 md:fixed md:inset-y-0 md:border-r md:border-slate-200 md:bg-white">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-200">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 text-white text-lg">
          💰
        </div>
        <span className="font-semibold tracking-tight">Money Mgmt</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <form action={signOut} className="p-3 border-t border-slate-200">
        <button
          type="submit"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 w-full"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </form>
    </aside>
  );
}
