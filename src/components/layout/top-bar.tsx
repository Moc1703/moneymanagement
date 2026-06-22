"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function TopBar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 md:px-6 bg-white/80 backdrop-blur border-b border-slate-200">
      <h1 className="text-base md:text-lg font-semibold tracking-tight">{title}</h1>
      <form action={signOut}>
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="text-slate-600 md:hidden"
          aria-label="Keluar"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </form>
    </header>
  );
}
