"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
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
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Budget ${category.name} disimpan`);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-3 mb-3">
        <span
          className="flex items-center justify-center w-10 h-10 rounded-xl text-lg shrink-0 ring-1 ring-inset"
          style={{
            backgroundColor: `${category.color}1A`,
            color: category.color,
            boxShadow: `inset 0 0 0 1px ${category.color}33`,
          }}
        >
          {category.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm">{category.name}</p>
          <p className="text-[11px] text-muted-foreground">
            Terpakai bulan ini: <span className="tabular-nums">{formatIDR(spent)}</span>
          </p>
        </div>
      </div>

      {hasBudget && <BudgetProgressBar spent={spent} amount={amount} color={category.color} />}

      <div className="flex items-end gap-2 mt-3">
        <div className="flex-1 space-y-1">
          <label className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
            Budget bulanan
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
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
        <Button
          onClick={save}
          disabled={!dirty || isPending}
          className="min-h-11 gradient-brand text-white hover:opacity-90"
        >
          <Save className="w-4 h-4" />
          Simpan
        </Button>
      </div>
    </div>
  );
}
