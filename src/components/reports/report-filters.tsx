"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, Filter, ChevronDown } from "lucide-react";
import type { Account, Category, Project } from "@/lib/types";

type FilterState = {
  from: string;
  to: string;
  account: string[];
  project: string[];
  category: string[];
  type: "all" | "income" | "expense";
};

export function ReportFilters({
  accounts,
  categories,
  projects,
  defaults,
}: {
  accounts: Account[];
  categories: Category[];
  projects: Project[];
  defaults: FilterState;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<FilterState>(defaults);

  const apply = useCallback(() => {
    const params = new URLSearchParams();
    if (state.from) params.set("from", state.from);
    if (state.to) params.set("to", state.to);
    if (state.type !== "all") params.set("type", state.type);
    state.account.forEach((id) => params.append("account", id));
    state.project.forEach((id) => params.append("project", id));
    state.category.forEach((id) => params.append("category", id));
    const q = sp.get("q");
    if (q) params.set("q", q);

    startTransition(() => {
      router.push(`/reports?${params.toString()}`);
    });
  }, [state, router, sp]);

  function reset() {
    setState(defaults);
    startTransition(() => router.push("/reports"));
  }

  const activeFilters =
    state.account.length + state.project.length + state.category.length + (state.type !== "all" ? 1 : 0);

  function toggle(list: "account" | "project" | "category", id: string) {
    setState((s) => {
      const arr = s[list];
      return {
        ...s,
        [list]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id],
      };
    });
  }

  return (
    <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors min-h-12"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
            <Filter className="w-4 h-4" />
          </span>
          <div className="text-left">
            <p className="text-sm font-bold leading-tight">Filter Laporan</p>
            <p className="text-[11px] text-muted-foreground">
              {activeFilters === 0 ? "Tanpa filter aktif" : `${activeFilters} filter aktif`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {activeFilters > 0 && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
              aria-label="Reset filter"
            >
              <X className="w-4 h-4" />
            </span>
          )}
          <ChevronDown
            className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-border/70 px-4 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="from" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                Dari
              </Label>
              <Input
                id="from"
                type="date"
                value={state.from}
                onChange={(e) => setState((s) => ({ ...s, from: e.target.value }))}
                className="mt-1.5 min-h-11"
              />
            </div>
            <div>
              <Label htmlFor="to" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                Sampai
              </Label>
              <Input
                id="to"
                type="date"
                value={state.to}
                onChange={(e) => setState((s) => ({ ...s, to: e.target.value }))}
                className="mt-1.5 min-h-11"
              />
            </div>
          </div>

          <div>
            <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Tipe</Label>
            <div className="grid grid-cols-3 gap-1.5 mt-1.5">
              {(["all", "income", "expense"] as const).map((t) => {
                const active = state.type === t;
                const label = t === "all" ? "Semua" : t === "income" ? "Masuk" : "Keluar";
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setState((s) => ({ ...s, type: t }))}
                    className={cn(
                      "min-h-10 rounded-xl text-sm font-semibold transition-colors",
                      active
                        ? t === "income"
                          ? "bg-emerald-500 text-white shadow-soft"
                          : t === "expense"
                            ? "bg-rose-500 text-white shadow-soft"
                            : "bg-primary text-primary-foreground shadow-soft"
                        : "bg-muted text-foreground/80 hover:bg-accent",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Rekening</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {accounts.map((acc) => {
                const active = state.account.includes(acc.id);
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => toggle("account", acc.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors min-h-9",
                      active
                        ? "text-white border-transparent shadow-soft"
                        : "bg-card text-foreground/80 border-border hover:bg-muted",
                    )}
                    style={active ? { backgroundColor: acc.color } : undefined}
                  >
                    <span>{acc.icon}</span>
                    <span>{acc.name.replace("Rekening ", "")}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Project</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {projects
                .filter((p) => !p.is_archived)
                .map((proj) => {
                  const active = state.project.includes(proj.id);
                  return (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => toggle("project", proj.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors min-h-9",
                        active
                          ? "text-white border-transparent shadow-soft"
                          : "bg-card text-foreground/80 border-border hover:bg-muted",
                      )}
                      style={active ? { backgroundColor: proj.color } : undefined}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: active ? "white" : proj.color }}
                      />
                      {proj.name}
                    </button>
                  );
                })}
            </div>
          </div>

          <div>
            <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Kategori</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {categories.map((cat) => {
                const active = state.category.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggle("category", cat.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors min-h-9",
                      active
                        ? "text-white border-transparent shadow-soft"
                        : "bg-card text-foreground/80 border-border hover:bg-muted",
                    )}
                    style={active ? { backgroundColor: cat.color } : undefined}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={apply} disabled={isPending} className="w-full" size="lg">
            {isPending ? "Memuat…" : "Terapkan Filter"}
          </Button>
        </div>
      )}
    </div>
  );
}
