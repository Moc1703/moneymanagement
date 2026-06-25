"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ChevronDown, ChevronUp, Save, Trash2 } from "lucide-react";
import { parseIDR } from "@/lib/utils/format";
import type { Account } from "@/lib/types";

const COLOR_OPTIONS = ["#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#64748b"];
const ICON_OPTIONS = ["💳", "👩", "🧑", "🏪", "💰", "🏦", "💼", "🎯"];

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
    new Intl.NumberFormat("id-ID").format(account.initial_balance)
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
    <Card className="mb-2">
      <CardContent className="p-0">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <span className="font-medium">
            {account.icon} {account.name}
          </span>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {open && (
          <form action={handleSubmit} className="px-4 pb-4 space-y-3 border-t border-border/70 pt-3">
            <input type="hidden" name="type" value={account.type} />

            <div className="space-y-1">
              <Label htmlFor={`name-${account.id}`}>Nama</Label>
              <Input id={`name-${account.id}`} name="name" defaultValue={account.name} required />
            </div>

            <div className="space-y-1">
              <Label htmlFor={`balance-${account.id}`}>Saldo Awal</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                <Input
                  id={`balance-${account.id}`}
                  value={displayBalance}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    setDisplayBalance(raw ? new Intl.NumberFormat("id-ID").format(parseInt(raw)) : "");
                  }}
                  inputMode="numeric"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">Saldo saat ini dihitung otomatis dari transaksi</p>
            </div>

            <div className="space-y-1">
              <Label>Warna</Label>
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
                      className="w-8 h-8 rounded-full ring-2 ring-transparent peer-checked:ring-primary peer-checked:ring-offset-2 transition"
                      style={{ backgroundColor: c }}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((i) => (
                  <label key={i} className="cursor-pointer">
                    <input
                      type="radio"
                      name="icon"
                      value={i}
                      defaultChecked={account.icon === i}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl ring-2 ring-transparent peer-checked:ring-primary peer-checked:bg-muted transition">
                      {i}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isPending} className="flex-1">
                <Save className="w-4 h-4 mr-1" />
                Simpan
              </Button>
              <ConfirmDialog
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    aria-label="Arsipkan"
                    className="min-w-11 min-h-11"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                }
                title={`Arsipkan rekening "${account.name}"?`}
                description="Rekening ini akan disembunyikan dari daftar. Transaksi yang sudah ada tetap tersimpan."
                confirmLabel="Arsipkan"
                tone="destructive"
                onConfirm={handleArchive}
              />
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
