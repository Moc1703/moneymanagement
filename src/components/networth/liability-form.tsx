"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLiability } from "@/actions/networth";
import { parseIDR } from "@/lib/utils/format";
import type { LiabilityType } from "@/lib/types";

const TYPES: { value: LiabilityType; label: string; icon: string; color: string }[] = [
  { value: "mortgage", label: "KPR", icon: "🏠", color: "#ef4444" },
  { value: "loan", label: "Pinjaman", icon: "🪙", color: "#f59e0b" },
  { value: "credit_card", label: "Kartu Kredit", icon: "💳", color: "#a855f7" },
  { value: "paylater", label: "Paylater", icon: "📲", color: "#ec4899" },
  { value: "other", label: "Lainnya", icon: "📦", color: "#64748b" },
];

export function LiabilityForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<LiabilityType>("mortgage");
  const [balance, setBalance] = useState("");
  const [original, setOriginal] = useState("");

  const meta = TYPES.find((t) => t.value === type)!;

  function onSubmit(formData: FormData) {
    formData.set("type", type);
    formData.set("current_balance", String(parseIDR(balance || "0")));
    if (original) formData.set("original_amount", String(parseIDR(original)));
    formData.set("icon", meta.icon);
    formData.set("color", meta.color);
    startTransition(async () => {
      const result = await createLiability(formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Hutang ditambahkan");
        setBalance("");
        setOriginal("");
        router.refresh();
      }
    });
  }

  return (
    <form action={onSubmit} className="rounded-3xl bg-card border border-border shadow-soft p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-300">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
        </span>
        <h3 className="text-sm font-semibold">Tambah hutang besar</h3>
      </div>

      <div className="space-y-1.5">
        <Label>Jenis</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`min-h-11 px-3 rounded-xl text-xs font-medium transition-colors flex items-center justify-start gap-2 ${
                type === t.value
                  ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/20"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-base">{t.icon}</span>
              <span className="truncate">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="liab-name">Nama</Label>
        <Input id="liab-name" name="name" placeholder="KPR BCA, Akulaku, dll" required className="min-h-11" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="liab-balance">Sisa</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
            <Input
              id="liab-balance"
              value={balance}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                setBalance(raw ? new Intl.NumberFormat("id-ID").format(parseInt(raw, 10)) : "");
              }}
              inputMode="numeric"
              placeholder="0"
              required
              className="pl-10 min-h-11"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="liab-original">Pokok awal</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
            <Input
              id="liab-original"
              value={original}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                setOriginal(raw ? new Intl.NumberFormat("id-ID").format(parseInt(raw, 10)) : "");
              }}
              inputMode="numeric"
              placeholder="Opsional"
              className="pl-10 min-h-11"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="liab-rate">Bunga %/tahun</Label>
          <Input id="liab-rate" name="interest_rate_pct" type="number" step="0.01" placeholder="Opsional" className="min-h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="liab-end">Tenor sampai</Label>
          <Input id="liab-end" name="end_date" type="date" className="min-h-11" />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full gradient-brand text-white hover:opacity-90 min-h-11">
        {isPending ? "Menyimpan…" : "Tambah hutang"}
      </Button>
    </form>
  );
}
