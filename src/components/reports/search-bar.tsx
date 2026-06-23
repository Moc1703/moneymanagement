"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

export function SearchBar({ initial }: { initial?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [value, setValue] = useState(initial ?? "");
  const [, startTransition] = useTransition();

  useEffect(() => {
    setValue(initial ?? "");
  }, [initial]);

  function navigate(next: string) {
    const params = new URLSearchParams(sp.toString());
    if (next.trim()) params.set("q", next.trim());
    else params.delete("q");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate(value);
  }

  function clear() {
    setValue("");
    navigate("");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative flex items-center rounded-2xl border border-border bg-card shadow-soft focus-within:ring-2 focus-within:ring-primary/30 transition-shadow"
    >
      <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari deskripsi transaksi…"
        className="w-full bg-transparent pl-10 pr-12 py-3 text-sm outline-none placeholder:text-muted-foreground min-h-11"
        aria-label="Cari transaksi"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-1.5 flex items-center justify-center w-11 h-11 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Hapus pencarian"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}
