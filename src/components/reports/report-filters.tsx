"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";
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

    startTransition(() => {
      router.push(`/reports?${params.toString()}`);
    });
  }, [state, router]);

  const reset = () => {
    setState(defaults);
    startTransition(() => router.push("/reports"));
  };

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
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="font-medium text-sm">Filter</span>
            {activeFilters > 0 && (
              <span className="bg-slate-900 text-white text-xs px-1.5 py-0.5 rounded-full">
                {activeFilters}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={reset} disabled={isPending}>
              <X className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={() => setOpen(!open)}>
              {open ? "Tutup" : "Atur"}
            </Button>
          </div>
        </div>

        {open && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="from" className="text-xs">Dari</Label>
                <Input
                  id="from"
                  type="date"
                  value={state.from}
                  onChange={(e) => setState((s) => ({ ...s, from: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="to" className="text-xs">Sampai</Label>
                <Input
                  id="to"
                  type="date"
                  value={state.to}
                  onChange={(e) => setState((s) => ({ ...s, to: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Tipe</Label>
              <div className="grid grid-cols-3 gap-1 mt-1">
                {(["all", "income", "expense"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setState((s) => ({ ...s, type: t }))}
                    className={`text-xs py-2 rounded-lg border transition ${
                      state.type === t
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    {t === "all" ? "Semua" : t === "income" ? "Pemasukan" : "Pengeluaran"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs">Rekening</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => toggle("account", acc.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${
                      state.account.includes(acc.id)
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    {acc.icon} {acc.name.replace("Rekening ", "")}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs">Project</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {projects.filter((p) => !p.is_archived).map((proj) => (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => toggle("project", proj.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${
                      state.project.includes(proj.id)
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full inline-block mr-1" style={{ backgroundColor: proj.color }} />
                    {proj.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs">Kategori</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggle("category", cat.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${
                      state.category.includes(cat.id)
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={apply} disabled={isPending} className="w-full">
              {isPending ? "Memuat..." : "Terapkan Filter"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
