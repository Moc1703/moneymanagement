"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addGoalContribution } from "@/actions/goals";
import { parseIDR } from "@/lib/utils/format";

export function ContributeForm({ goalId }: { goalId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [direction, setDirection] = useState<"in" | "out">("in");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  function handleSubmit() {
    const raw = parseIDR(amount || "0");
    if (raw <= 0) {
      toast.error("Nominal harus lebih dari 0");
      return;
    }
    const signed = direction === "out" ? -raw : raw;
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
    <div className="rounded-2xl border border-border bg-card shadow-soft p-4 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setDirection("in")}
          className={`min-h-11 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
            direction === "in"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Plus className="w-4 h-4" /> Tambah
        </button>
        <button
          type="button"
          onClick={() => setDirection("out")}
          className={`min-h-11 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
            direction === "out"
              ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Minus className="w-4 h-4" /> Tarik
        </button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="amount">Nominal</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
          <Input
            id="amount"
            value={amount}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              setAmount(raw ? new Intl.NumberFormat("id-ID").format(parseInt(raw, 10)) : "");
            }}
            inputMode="numeric"
            placeholder="0"
            className="pl-10 min-h-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="date">Tanggal</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="min-h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="note">Catatan</Label>
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
        disabled={isPending}
        className="w-full gradient-brand text-white hover:opacity-90 min-h-11"
      >
        {isPending ? "Menyimpan…" : direction === "in" ? "Tambah ke goal" : "Tarik dari goal"}
      </Button>
    </div>
  );
}
