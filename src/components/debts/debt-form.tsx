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
    <form action={onSubmit} className="rounded-3xl bg-card border border-border shadow-soft p-5 space-y-5">
      <div className="flex items-center gap-3">
        <span
          className={`flex items-center justify-center w-12 h-12 rounded-2xl text-2xl ring-1 ring-inset ${
            direction === "owe"
              ? "bg-rose-500/15 text-rose-600 dark:text-rose-300 ring-rose-500/30"
              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 ring-emerald-500/30"
          }`}
        >
          <HandCoins className="w-5 h-5" strokeWidth={2.25} />
        </span>
        <div>
          <h3 className="text-base font-extrabold tracking-tight">Catat hutang/piutang</h3>
          <p className="text-[11px] text-muted-foreground">Pinjam ke orang atau dipinjam</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => setDirection("owe")}
          className={`min-h-12 rounded-xl text-sm font-semibold transition-all ${
            direction === "owe"
              ? "bg-rose-500 text-white shadow-soft"
              : "bg-muted text-foreground/80 hover:bg-accent"
          }`}
        >
          Saya pinjam
        </button>
        <button
          type="button"
          onClick={() => setDirection("lent")}
          className={`min-h-12 rounded-xl text-sm font-semibold transition-all ${
            direction === "lent"
              ? "bg-emerald-500 text-white shadow-soft"
              : "bg-muted text-foreground/80 hover:bg-accent"
          }`}
        >
          Dipinjam
        </button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="counterparty" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          {direction === "owe" ? "Pinjam ke" : "Dipinjam oleh"}
        </Label>
        <Input id="counterparty" name="counterparty" placeholder="Nama orang" required className="min-h-11" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="principal" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          Nominal
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">Rp</span>
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
          <Label htmlFor="due_date" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Jatuh tempo
          </Label>
          <Input id="due_date" name="due_date" type="date" className="min-h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="note" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Catatan
          </Label>
          <Input id="note" name="note" placeholder="Opsional" className="min-h-11" />
        </div>
      </div>

      <Button type="submit" disabled={isPending} size="lg" className="w-full">
        {isPending ? "Menyimpan…" : "Simpan catatan"}
      </Button>
    </form>
  );
}
