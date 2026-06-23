"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGoal } from "@/actions/goals";
import { parseIDR } from "@/lib/utils/format";
import type { Account } from "@/lib/types";

const COLOR_OPTIONS = ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#3b82f6", "#ef4444", "#8b5cf6"];
const ICON_OPTIONS = ["🎯", "🏠", "🚗", "🛵", "✈️", "🎓", "💍", "🐐", "📱", "💻", "🪙", "🎂"];

export function GoalForm({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);

  function onSubmit(formData: FormData) {
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
      className="rounded-3xl bg-card border border-border shadow-soft p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl gradient-brand text-white">
          <Sparkles className="w-4 h-4" strokeWidth={2.5} />
        </span>
        <div>
          <h3 className="text-sm font-semibold">Goal baru</h3>
          <p className="text-[11px] text-muted-foreground">Tabungan dengan target tanggal</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Nama goal</Label>
        <Input id="name" name="name" placeholder="Liburan Bali, DP rumah, dll" required className="min-h-11" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="target_amount">Target nominal</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
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
          <Label htmlFor="target_date">Tanggal target (opsional)</Label>
          <Input id="target_date" name="target_date" type="date" className="min-h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="account_id">Rekening (opsional)</Label>
          <select
            id="account_id"
            name="account_id"
            className="w-full rounded-lg border border-input bg-background px-3 min-h-11 text-sm"
            defaultValue=""
          >
            <option value="">— pilih —</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.icon} {a.name.replace("Rekening ", "")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Icon</Label>
        <div className="flex flex-wrap gap-2">
          {ICON_OPTIONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition ${
                icon === i ? "bg-primary/10 ring-2 ring-primary" : "bg-muted hover:bg-muted/70"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Warna</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-9 h-9 rounded-full transition ${
                color === c ? "ring-2 ring-offset-2 ring-foreground" : ""
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Pilih warna ${c}`}
            />
          ))}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full gradient-brand text-white hover:opacity-90 min-h-11"
        size="lg"
      >
        {isPending ? "Membuat…" : "Buat goal"}
      </Button>
    </form>
  );
}
