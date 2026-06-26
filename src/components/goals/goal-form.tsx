"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createGoal } from "@/actions/goals";
import { parseIDR } from "@/lib/utils/format";
import type { Account } from "@/lib/types";

const COLOR_OPTIONS = [
  "#7c3aed", "#06b6d4", "#10b981", "#f59e0b",
  "#ec4899", "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6", "#f43f5e",
];
const ICON_OPTIONS = [
  "🎯", "🏠", "🚗", "🛵", "✈️", "🎓",
  "💍", "🐐", "📱", "💻", "🪙", "🎂",
];

export function GoalForm({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);

  function onSubmit(formData: FormData) {
    formData.set("name", name);
    formData.set("target_amount", String(parseIDR(amount || "0")));
    formData.set("color", color);
    formData.set("icon", icon);
    startTransition(async () => {
      const result = await createGoal(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Goal dibuat 🎯");
        if (result.data?.id) router.push(`/goals/${result.data.id}`);
      }
    });
  }

  return (
    <form
      action={onSubmit}
      className="rounded-3xl bg-card border border-border shadow-soft p-5 space-y-5"
    >
      <div className="flex items-center gap-3">
        <span
          className="flex items-center justify-center w-12 h-12 rounded-2xl text-2xl ring-1 ring-inset"
          style={{
            backgroundColor: `${color}1F`,
            color: color,
            boxShadow: `inset 0 0 0 1px ${color}33`,
          }}
        >
          {icon}
        </span>
        <div>
          <h3 className="text-base font-extrabold tracking-tight">Bikin goal baru</h3>
          <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
            <Target className="w-3 h-3" />
            Tabungan dengan target nominal & tanggal
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          Nama goal
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Liburan Bali, DP rumah, Dana darurat"
          required
          className="min-h-11"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="target_amount"
          className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground"
        >
          Target nominal
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">
            Rp
          </span>
          <Input
            id="target_amount"
            value={amount}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              setAmount(raw ? new Intl.NumberFormat("id-ID").format(parseInt(raw, 10)) : "");
            }}
            inputMode="numeric"
            placeholder="0"
            required
            className="pl-10 min-h-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label
            htmlFor="target_date"
            className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground"
          >
            Tanggal target
          </Label>
          <Input id="target_date" name="target_date" type="date" className="min-h-11" />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="account_id"
            className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground"
          >
            Rekening
          </Label>
          <select
            id="account_id"
            name="account_id"
            className="w-full rounded-xl border border-input bg-card px-3 min-h-11 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
            defaultValue=""
          >
            <option value="">— opsional —</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.icon} {a.name.replace("Rekening ", "")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Icon</Label>
        <div className="grid grid-cols-6 gap-1.5">
          {ICON_OPTIONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={cn(
                "h-11 rounded-xl flex items-center justify-center text-xl transition-all",
                icon === i ? "bg-primary/10 ring-2 ring-primary" : "bg-muted hover:bg-accent",
              )}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Warna</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                "w-9 h-9 rounded-full transition-all",
                color === c ? "ring-2 ring-offset-2 ring-foreground" : "",
              )}
              style={{ backgroundColor: c }}
              aria-label={`Warna ${c}`}
            />
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isPending || !name.trim()} size="lg" className="w-full">
        {isPending ? "Membuat…" : `Buat goal${name ? ` "${name}"` : ""}`}
      </Button>
    </form>
  );
}
