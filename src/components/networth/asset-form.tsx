"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAsset } from "@/actions/networth";
import { parseIDR } from "@/lib/utils/format";
import type { AssetType } from "@/lib/types";

const TYPES: { value: AssetType; label: string; icon: string; color: string }[] = [
  { value: "savings", label: "Tabungan", icon: "💰", color: "#10b981" },
  { value: "investment", label: "Reksa dana/Saham", icon: "📈", color: "#3b82f6" },
  { value: "gold", label: "Emas", icon: "🪙", color: "#f59e0b" },
  { value: "property", label: "Properti", icon: "🏠", color: "#8b5cf6" },
  { value: "vehicle", label: "Kendaraan", icon: "🛵", color: "#ef4444" },
  { value: "crypto", label: "Crypto", icon: "₿", color: "#6366f1" },
  { value: "other", label: "Lainnya", icon: "📦", color: "#64748b" },
];

export function AssetForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<AssetType>("investment");
  const [value, setValue] = useState("");

  const meta = TYPES.find((t) => t.value === type)!;

  function onSubmit(formData: FormData) {
    formData.set("type", type);
    formData.set("current_value", String(parseIDR(value || "0")));
    formData.set("icon", meta.icon);
    formData.set("color", meta.color);
    startTransition(async () => {
      const result = await createAsset(formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Aset ditambahkan");
        setValue("");
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
          <h3 className="text-base font-extrabold tracking-tight">Tambah aset</h3>
          <p className="text-[11px] text-muted-foreground">Investasi, emas, properti, kendaraan</p>
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
        <Label htmlFor="asset-name" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          Nama
        </Label>
        <Input id="asset-name" name="name" placeholder="cth: Bibit Reksa Dana, LM 5gr" required className="min-h-11" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="asset-value" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          Nilai sekarang
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">Rp</span>
          <Input
            id="asset-value"
            value={value}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              setValue(raw ? new Intl.NumberFormat("id-ID").format(parseInt(raw, 10)) : "");
            }}
            inputMode="numeric"
            placeholder="0"
            required
            className="pl-10 min-h-11"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="asset-note" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          Catatan
        </Label>
        <Input id="asset-note" name="note" placeholder="Opsional" className="min-h-11" />
      </div>

      <Button type="submit" disabled={isPending} size="lg" className="w-full">
        {isPending ? "Menyimpan…" : "Tambah aset"}
      </Button>
    </form>
  );
}
