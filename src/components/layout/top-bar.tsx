"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-border/60">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        <div className="min-w-0">
          <h1 className="text-base md:text-lg font-semibold tracking-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground -mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-muted-foreground md:hidden"
            aria-label="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
