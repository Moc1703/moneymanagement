"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDebt } from "@/actions/debts";
import { parseIDR } from "@/lib/utils/format";

export function DebtForm({ defaultDirection = "owe" }: { defaultDirection?: "owe" | "lent" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [direction, setDirection] = useState<"owe" | "lent">(defaultDirection);
  const [principal, setPrincipal] = useState("");

  function onSubmit(formData: FormData) {
    formData.set("direction", direction);
    formData.set("principal", String(parseIDR(principal || "0")));
    startTransition(async () => {
      const result = await createDebt(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Tercatat");
        setPrincipal("");
        router.refresh();
      }
    });
  }

  return (
    <form action={onSubmit} className="rounded-3xl bg-card border border-border shadow-soft p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl gradient-brand text-white">
          <HandCoins className="w-4 h-4" strokeWidth={2.5} />
        </span>
        <div>
          <h3 className="text-sm font-semibold">Catat hutang / piutang</h3>
          <p className="text-[11px] text-muted-foreground">Pinjam ke orang atau dipinjam</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setDirection("owe")}
          className={`min-h-11 rounded-xl text-sm font-medium transition-colors ${
            direction === "owe"
              ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30"
              : "bg-muted text-muted-foreground"
          }`}
        >
          Saya pinjam
        </button>
        <button
          type="button"
          onClick={() => setDirection("lent")}
          className={`min-h-11 rounded-xl text-sm font-medium transition-colors ${
            direction === "lent"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30"
              : "bg-muted text-muted-foreground"
          }`}
        >
          Dipinjam
        </button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="counterparty">{direction === "owe" ? "Pinjam ke" : "Dipinjam oleh"}</Label>
        <Input id="counterparty" name="counterparty" placeholder="Nama orang" required className="min-h-11" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="principal">Nominal</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
          <Input
            id="principal"
            value={principal}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              setPrincipal(raw ? new Intl.NumberFormat("id-ID").format(parseInt(raw, 10)) : "");
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
          <Label htmlFor="due_date">Jatuh tempo (opsional)</Label>
          <Input id="due_date" name="due_date" type="date" className="min-h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="note">Catatan</Label>
          <Input id="note" name="note" placeholder="Opsional" className="min-h-11" />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full gradient-brand text-white hover:opacity-90 min-h-11">
        {isPending ? "Menyimpan…" : "Simpan"}
      </Button>
    </form>
  );
}
