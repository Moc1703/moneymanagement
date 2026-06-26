"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
    <form action={onSubmit} className="rounded-3xl bg-card border border-border shadow-soft p-5 space-y-5">
      <div className="flex items-center gap-3">
        <span
          className="flex items-center justify-center w-12 h-12 rounded-2xl text-2xl ring-1 ring-inset"
          style={{
            backgroundColor: `${meta.color}1F`,
            color: meta.color,
            boxShadow: `inset 0 0 0 1px ${meta.color}33`,
          }}
        >
          {meta.icon}
        </span>
        <div>
          <h3 className="text-base font-extrabold tracking-tight">Tambah hutang besar</h3>
          <p className="text-[11px] text-muted-foreground">KPR, paylater, kartu kredit, pinjaman</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Jenis</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`min-h-12 px-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-start gap-2 ${
                type === t.value
                  ? "ring-2 shadow-soft"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
              style={
                type === t.value
                  ? { backgroundColor: `${t.color}1A`, color: t.color, ["--tw-ring-color" as string]: t.color }
                  : undefined
              }
            >
              <span className="text-base">{t.icon}</span>
              <span className="truncate">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="liab-name" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          Nama
        </Label>
        <Input id="liab-name" name="name" placeholder="cth: KPR BCA, Akulaku" required className="min-h-11" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="liab-balance" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Sisa
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">Rp</span>
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
          <Label htmlFor="liab-original" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Pokok awal
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">Rp</span>
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
          <Label htmlFor="liab-rate" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Bunga %/tahun
          </Label>
          <Input id="liab-rate" name="interest_rate_pct" type="number" step="0.01" placeholder="Opsional" className="min-h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="liab-end" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Tenor sampai
          </Label>
          <Input id="liab-end" name="end_date" type="date" className="min-h-11" />
        </div>
      </div>

      <Button type="submit" disabled={isPending} size="lg" className="w-full">
        {isPending ? "Menyimpan…" : "Tambah hutang"}
      </Button>
    </form>
  );
}
