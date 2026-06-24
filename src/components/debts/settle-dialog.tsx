"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { settleDebt } from "@/actions/debts";
import { formatIDR, parseIDR } from "@/lib/utils/format";

type Props = {
  debtId: string;
  counterparty: string;
  outstanding: number;
  trigger: React.ReactNode;
};

export function SettleDialog({ debtId, counterparty, outstanding, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState(new Intl.NumberFormat("id-ID").format(outstanding));
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  function payAll() {
    setAmount(new Intl.NumberFormat("id-ID").format(outstanding));
  }

  function submit() {
    const raw = parseIDR(amount);
    if (raw <= 0) {
      toast.error("Nominal harus lebih dari 0");
      return;
    }
    if (raw > outstanding) {
      toast.error(`Maksimal Rp ${new Intl.NumberFormat("id-ID").format(outstanding)}`);
      return;
    }
    const fd = new FormData();
    fd.set("debt_id", debtId);
    fd.set("amount", String(raw));
    fd.set("payment_date", date);
    fd.set("note", note);
    startTransition(async () => {
      const result = await settleDebt(fd);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(raw === outstanding ? "Lunas! 🎉" : "Pembayaran dicatat");
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)} className="contents">
        {trigger}
      </span>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 shrink-0">
              <Check className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle>Bayar / Terima pembayaran</DialogTitle>
              <DialogDescription className="mt-1">
                {counterparty} · sisa <span className="font-semibold tabular-nums">{formatIDR(outstanding)}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="pay-amount">Nominal</Label>
              <button
                type="button"
                onClick={payAll}
                className="text-[11px] font-medium text-primary hover:underline"
              >
                Lunasin semua
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
              <Input
                id="pay-amount"
                value={amount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setAmount(raw ? new Intl.NumberFormat("id-ID").format(parseInt(raw, 10)) : "");
                }}
                inputMode="numeric"
                className="pl-10 min-h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="pay-date">Tanggal</Label>
              <Input id="pay-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="min-h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-note">Catatan</Label>
              <Input
                id="pay-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Opsional"
                className="min-h-11"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Batal
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPending ? "Menyimpan…" : "Catat pembayaran"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
