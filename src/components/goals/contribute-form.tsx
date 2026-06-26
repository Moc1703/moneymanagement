"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { addGoalContribution } from "@/actions/goals";
import { parseIDR, formatIDR } from "@/lib/utils/format";

const QUICK_AMOUNTS = [50000, 100000, 250000, 500000, 1000000];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function ContributeForm({ goalId }: { goalId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [direction, setDirection] = useState<"in" | "out">("in");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState("");

  const amountValue = parseIDR(amount);
  const accentColor = direction === "in" ? "oklch(0.65 0.17 165)" : "oklch(0.62 0.23 25)";

  function setFromRaw(raw: string) {
    const digits = raw.replace(/[^0-9]/g, "");
    setAmount(digits ? new Intl.NumberFormat("id-ID").format(parseInt(digits, 10)) : "");
  }

  function quickAdd(n: number) {
    const next = (amountValue || 0) + n;
    setAmount(new Intl.NumberFormat("id-ID").format(next));
  }

  function handleSubmit() {
    if (amountValue <= 0) {
      toast.error("Nominal harus lebih dari 0");
      return;
    }
    const signed = direction === "out" ? -amountValue : amountValue;
    const fd = new FormData();
    fd.set("goal_id", goalId);
    fd.set("amount", String(signed));
    fd.set("contribution_date", date);
    fd.set("note", note);
    startTransition(async () => {
      const result = await addGoalContribution(fd);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(direction === "in" ? "Kontribusi ditambah 🎉" : "Penarikan dicatat");
        setAmount("");
        setNote("");
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-3xl border border-border bg-card shadow-soft p-5 space-y-5">
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => setDirection("in")}
          className={cn(
            "min-h-12 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5",
            direction === "in"
              ? "bg-emerald-500 text-white shadow-soft"
              : "bg-muted text-foreground/80 hover:bg-accent",
          )}
        >
          <Plus className="w-4 h-4" /> Nabung
        </button>
        <button
          type="button"
          onClick={() => setDirection("out")}
          className={cn(
            "min-h-12 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5",
            direction === "out"
              ? "bg-rose-500 text-white shadow-soft"
              : "bg-muted text-foreground/80 hover:bg-accent",
          )}
        >
          <Minus className="w-4 h-4" /> Tarik
        </button>
      </div>

      {/* Hero amount */}
      <div className="rounded-2xl bg-muted/40 border border-border/60 p-5 text-center">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
          {direction === "in" ? "Mau nabung berapa?" : "Mau tarik berapa?"}
        </p>
        <div className="mt-3 flex items-baseline justify-center gap-2">
          <span
            className="text-xl md:text-2xl font-bold transition-colors"
            style={{ color: amountValue > 0 ? accentColor : "var(--muted-foreground)" }}
          >
            Rp
          </span>
          <input
            inputMode="numeric"
            value={amount}
            onChange={(e) => setFromRaw(e.target.value)}
            placeholder="0"
            aria-label="Nominal"
            className="bg-transparent border-0 outline-none w-full max-w-[240px] text-center font-extrabold tracking-tight tabular-nums text-4xl md:text-5xl leading-none transition-colors placeholder:text-muted-foreground/40 caret-primary"
            style={{ color: amountValue > 0 ? accentColor : undefined }}
          />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {QUICK_AMOUNTS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => quickAdd(n)}
              className="rounded-full bg-card hover:bg-accent border border-border text-foreground/80 px-3 py-1.5 text-xs font-semibold transition-colors min-h-8"
            >
              +{n >= 1_000_000 ? `${n / 1_000_000}jt` : `${n / 1000}rb`}
            </button>
          ))}
          {amount && (
            <button
              type="button"
              onClick={() => setAmount("")}
              className="rounded-full text-muted-foreground hover:text-rose-600 px-3 py-1.5 text-xs font-semibold transition-colors min-h-8"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="date" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Tanggal
          </Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="min-h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="note" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Catatan
          </Label>
          <Input
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Opsional"
            className="min-h-11"
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isPending || amountValue <= 0}
        variant={direction === "in" ? "positive" : "default"}
        size="lg"
        className="w-full"
      >
        {isPending
          ? "Menyimpan…"
          : direction === "in"
            ? `Nabung ${amountValue > 0 ? formatIDR(amountValue) : ""}`
            : `Tarik ${amountValue > 0 ? formatIDR(amountValue) : ""}`}
      </Button>
    </div>
  );
}
