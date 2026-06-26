"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ChevronDown, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseIDR, formatIDR } from "@/lib/utils/format";
import type { Account } from "@/lib/types";

const COLOR_OPTIONS = [
  "#7c3aed", "#3b82f6", "#10b981", "#f59e0b",
  "#ec4899", "#ef4444", "#06b6d4", "#8b5cf6", "#64748b", "#14b8a6",
];
const ICON_OPTIONS = [
  "💼", "💳", "🏦", "💰", "🪙", "💵",
  "👩", "🧑", "🏪", "🛒", "📱", "🎯",
];

export function AccountForm({
  account,
  onUpdate,
  onArchive,
}: {
  account: Account;
  onUpdate: (formData: FormData) => Promise<{ error?: string }>;
  onArchive: () => Promise<{ error?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [displayBalance, setDisplayBalance] = useState(
    new Intl.NumberFormat("id-ID").format(account.initial_balance),
  );

  function handleSubmit(formData: FormData) {
    formData.set("initial_balance", String(parseIDR(displayBalance)));
    startTransition(async () => {
      const result = await onUpdate(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Rekening diperbarui");
        setOpen(false);
      }
    });
  }

  async function handleArchive() {
    const result = await onArchive();
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Rekening diarsipkan");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/40 transition-colors min-h-16"
        aria-expanded={open}
      >
        <span
          className="flex items-center justify-center w-11 h-11 rounded-xl text-xl ring-1 ring-inset shrink-0"
          style={{
            backgroundColor: `${account.color}1F`,
            color: account.color,
            boxShadow: `inset 0 0 0 1px ${account.color}33`,
          }}
        >
          {account.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{account.name}</p>
          <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5 mt-0.5">
            <span
              className={
                account.type === "business"
                  ? "inline-flex rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider"
                  : "inline-flex rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider"
              }
            >
              {account.type === "business" ? "Usaha" : "Pribadi"}
            </span>
            <span>Saldo awal {formatIDR(account.initial_balance)}</span>
          </p>
        </div>
        <ChevronDown
          className={cn("w-4 h-4 text-muted-foreground transition-transform shrink-0", open && "rotate-180")}
        />
      </button>

      {open && (
        <form action={handleSubmit} className="px-4 pb-4 space-y-4 border-t border-border/70 pt-4">
          <input type="hidden" name="type" value={account.type} />

          <div className="space-y-1.5">
            <Label
              htmlFor={`name-${account.id}`}
              className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground"
            >
              Nama
            </Label>
            <Input id={`name-${account.id}`} name="name" defaultValue={account.name} required className="min-h-11" />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`balance-${account.id}`}
              className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground"
            >
              Saldo Awal
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">Rp</span>
              <Input
                id={`balance-${account.id}`}
                value={displayBalance}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setDisplayBalance(raw ? new Intl.NumberFormat("id-ID").format(parseInt(raw, 10)) : "");
                }}
                inputMode="numeric"
                className="pl-10 min-h-11"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Saldo saat ini = saldo awal + transaksi (otomatis).
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Icon</Label>
            <div className="grid grid-cols-6 gap-1.5">
              {ICON_OPTIONS.map((i) => (
                <label key={i} className="cursor-pointer">
                  <input
                    type="radio"
                    name="icon"
                    value={i}
                    defaultChecked={account.icon === i}
                    className="sr-only peer"
                  />
                  <div className="h-11 rounded-xl bg-muted flex items-center justify-center text-xl ring-2 ring-transparent peer-checked:ring-primary peer-checked:bg-primary/10 transition-all">
                    {i}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Warna</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <label key={c} className="cursor-pointer">
                  <input
                    type="radio"
                    name="color"
                    value={c}
                    defaultChecked={account.color === c}
                    className="sr-only peer"
                  />
                  <div
                    className="w-9 h-9 rounded-full ring-2 ring-transparent peer-checked:ring-foreground peer-checked:ring-offset-2 transition-all"
                    style={{ backgroundColor: c }}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={isPending} className="flex-1">
              <Save className="w-4 h-4" />
              Simpan
            </Button>
            <ConfirmDialog
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  aria-label="Hapus"
                  className="min-w-11"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              }
              title={`Hapus rekening "${account.name}"?`}
              description="Rekening ini akan disembunyikan dari daftar. Transaksi yang sudah ada tetap tersimpan & gak ke-pengaruh."
              confirmLabel="Hapus"
              tone="destructive"
              onConfirm={handleArchive}
            />
          </div>
        </form>
      )}
    </div>
  );
}
