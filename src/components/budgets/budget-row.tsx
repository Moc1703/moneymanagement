"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { upsertBudget } from "@/actions/budgets";
import { formatIDR, parseIDR } from "@/lib/utils/format";
import { BudgetProgressBar } from "./budget-progress-bar";
import type { Category } from "@/lib/types";

type Props = {
  category: Category;
  periodMonth: string;
  amount: number;
  spent: number;
};

export function BudgetRow({ category, periodMonth, amount, spent }: Props) {
  const [value, setValue] = useState(
    amount > 0 ? new Intl.NumberFormat("id-ID").format(amount) : "",
  );
  const [isPending, startTransition] = useTransition();
  const hasBudget = amount > 0;
  const original = amount > 0 ? new Intl.NumberFormat("id-ID").format(amount) : "";
  const dirty = value !== original;

  function save() {
    const fd = new FormData();
    fd.set("category_id", category.id);
    fd.set("period_month", periodMonth);
    fd.set("amount", String(parseIDR(value || "0")));
    startTransition(async () => {
      const result = await upsertBudget(fd);
      if (result.error) toast.error(result.error);
      else toast.success(`Budget ${category.name} disimpan ✅`);
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-soft-lg">
      <div className="flex items-center gap-3 mb-3">
        <span
          className="flex items-center justify-center w-11 h-11 rounded-xl text-xl shrink-0 ring-1 ring-inset"
          style={{
            backgroundColor: `${category.color}1A`,
            color: category.color,
            boxShadow: `inset 0 0 0 1px ${category.color}33`,
          }}
        >
          {category.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm">{category.name}</p>
          <p className="text-[11px] text-muted-foreground">
            Terpakai bulan ini: <span className="tabular-nums font-semibold">{formatIDR(spent)}</span>
          </p>
        </div>
        {hasBudget && !dirty && (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
          </span>
        )}
      </div>

      {hasBudget && <BudgetProgressBar spent={spent} amount={amount} color={category.color} />}

      <div className="flex items-end gap-2 mt-3">
        <div className="flex-1 space-y-1.5">
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Budget bulanan
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">
              Rp
            </span>
            <Input
              value={value}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                setValue(raw ? new Intl.NumberFormat("id-ID").format(parseInt(raw, 10)) : "");
              }}
              inputMode="numeric"
              placeholder="0"
              className="pl-10 min-h-11"
              aria-label={`Budget bulanan ${category.name}`}
            />
          </div>
        </div>
        <Button onClick={save} disabled={!dirty || isPending}>
          {isPending ? "..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
