"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
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
    <form action={onSubmit} className="rounded-3xl bg-card border border-border shadow-soft p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
        </span>
        <h3 className="text-sm font-semibold">Tambah aset</h3>
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
                  ? "bg-primary/10 text-primary ring-1 ring-primary/20"
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
        <Label htmlFor="asset-name">Nama</Label>
        <Input id="asset-name" name="name" placeholder="Bibit Reksa Dana, LM 5gr, dll" required className="min-h-11" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="asset-value">Nilai sekarang</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
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
        <Label htmlFor="asset-note">Catatan</Label>
        <Input id="asset-note" name="note" placeholder="Opsional" className="min-h-11" />
      </div>

      <Button type="submit" disabled={isPending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 min-h-11">
        {isPending ? "Menyimpan…" : "Tambah aset"}
      </Button>
    </form>
  );
}
