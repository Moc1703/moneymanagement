"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, parseIDR } from "@/lib/utils";
import { createAccount } from "@/actions/accounts";
import type { AccountType } from "@/lib/types";

const COLOR_OPTIONS = [
  "#7c3aed", "#3b82f6", "#10b981", "#f59e0b",
  "#ec4899", "#ef4444", "#06b6d4", "#8b5cf6", "#64748b", "#14b8a6",
];
const ICON_OPTIONS = [
  "💼", "💳", "🏦", "💰", "🪙", "💵",
  "👩", "🧑", "🏪", "🛒", "📱", "🎯",
];

export function AccountCreateForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("personal");
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [balance, setBalance] = useState("");

  function reset() {
    setName("");
    setType("personal");
    setIcon(ICON_OPTIONS[0]);
    setColor(COLOR_OPTIONS[0]);
    setBalance("");
  }

  function submit(formData: FormData) {
    formData.set("name", name);
    formData.set("type", type);
    formData.set("icon", icon);
    formData.set("color", color);
    formData.set("initial_balance", String(parseIDR(balance || "0")));
    startTransition(async () => {
      const result = await createAccount(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${name || "Rekening"} ditambahkan 🎉`);
        reset();
        setOpen(false);
        router.refresh();
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 min-h-14 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        Tambah Rekening Baru
      </button>
    );
  }

  return (
    <form
      action={submit}
      className="rounded-3xl bg-card border border-border shadow-soft p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="flex items-center justify-center w-10 h-10 rounded-xl text-lg ring-1 ring-inset"
            style={{
              backgroundColor: `${color}1F`,
              color: color,
              boxShadow: `inset 0 0 0 1px ${color}33`,
            }}
          >
            {icon}
          </span>
          <div>
            <p className="text-sm font-extrabold">Rekening baru</p>
            <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Tambah BCA, OVO, Dana, Cash, dll
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
        >
          Batal
        </button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="new-acc-name" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          Nama
        </Label>
        <Input
          id="new-acc-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          placeholder="cth: BCA, OVO, Cash"
          className="min-h-11"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          Tipe
        </Label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setType("personal")}
            className={cn(
              "min-h-11 rounded-xl text-sm font-semibold transition-colors",
              type === "personal"
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-muted text-foreground/80 hover:bg-accent",
            )}
          >
            Pribadi
          </button>
          <button
            type="button"
            onClick={() => setType("business")}
            className={cn(
              "min-h-11 rounded-xl text-sm font-semibold transition-colors",
              type === "business"
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-muted text-foreground/80 hover:bg-accent",
            )}
          >
            Usaha
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="new-acc-balance" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          Saldo Awal
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">Rp</span>
          <Input
            id="new-acc-balance"
            value={balance}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              setBalance(raw ? new Intl.NumberFormat("id-ID").format(parseInt(raw, 10)) : "");
            }}
            inputMode="numeric"
            placeholder="0"
            className="pl-10 min-h-11"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Saldo saat ini akan dihitung otomatis dari saldo awal + transaksi.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          Icon
        </Label>
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
              aria-label={`Icon ${i}`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          Warna
        </Label>
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
        {isPending ? "Menyimpan…" : "Tambah Rekening"}
      </Button>
    </form>
  );
}
