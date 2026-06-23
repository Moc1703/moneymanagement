"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRecurringRule } from "@/actions/recurring";
import { parseIDR } from "@/lib/utils/format";
import type { Account, Category, Frequency } from "@/lib/types";

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const FREQ_LABEL: Record<Frequency, string> = {
  weekly: "Mingguan",
  biweekly: "2 mingguan",
  monthly: "Bulanan",
  yearly: "Tahunan",
};

export function RecurringForm({
  accounts,
  categories,
}: {
  accounts: Account[];
  categories: Category[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [dayOfMonth, setDayOfMonth] = useState<number>(25);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);

  const filteredCategories = categories.filter((c) => c.type === type || c.type === "both");

  function onSubmit(formData: FormData) {
    formData.set("type", type);
    formData.set("amount", String(parseIDR(amount || "0")));
    formData.set("frequency", frequency);
    if (frequency === "monthly") formData.set("day_of_month", String(dayOfMonth));
    if (frequency === "weekly" || frequency === "biweekly") formData.set("day_of_week", String(dayOfWeek));

    startTransition(async () => {
      const result = await createRecurringRule(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Aturan berulang dibuat — transaksi otomatis di-generate 30 hari ke depan");
        setAmount("");
        router.refresh();
      }
    });
  }

  return (
    <form action={onSubmit} className="rounded-3xl bg-card border border-border shadow-soft p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl gradient-brand text-white">
          <Repeat className="w-4 h-4" strokeWidth={2.5} />
        </span>
        <div>
          <h3 className="text-sm font-semibold">Aturan baru</h3>
          <p className="text-[11px] text-muted-foreground">Gaji, KPR, langganan — auto-input tiap periode</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={`min-h-11 rounded-xl text-sm font-medium transition-colors ${
            type === "expense"
              ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30"
              : "bg-muted text-muted-foreground"
          }`}
        >
          Pengeluaran
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={`min-h-11 rounded-xl text-sm font-medium transition-colors ${
            type === "income"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30"
              : "bg-muted text-muted-foreground"
          }`}
        >
          Pemasukan
        </button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rec-amount">Nominal</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
          <Input
            id="rec-amount"
            value={amount}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              setAmount(raw ? new Intl.NumberFormat("id-ID").format(parseInt(raw, 10)) : "");
            }}
            inputMode="numeric"
            placeholder="0"
            required
            className="pl-10 min-h-11"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rec-description">Deskripsi</Label>
        <Input id="rec-description" name="description" placeholder="Gaji bulanan, Cicilan KPR, dll" className="min-h-11" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="rec-account">Rekening</Label>
          <select id="rec-account" name="account_id" required className="w-full rounded-lg border border-input bg-background px-3 min-h-11 text-sm">
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.icon} {a.name.replace("Rekening ", "")}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rec-category">Kategori</Label>
          <select id="rec-category" name="category_id" required className="w-full rounded-lg border border-input bg-background px-3 min-h-11 text-sm">
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Frekuensi</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {(["weekly", "biweekly", "monthly", "yearly"] as Frequency[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFrequency(f)}
              className={`min-h-9 rounded-lg text-xs font-medium transition-colors ${
                frequency === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {FREQ_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      {frequency === "monthly" && (
        <div className="space-y-1.5">
          <Label htmlFor="dom">Tanggal di bulan (1-31)</Label>
          <Input
            id="dom"
            type="number"
            min={1}
            max={31}
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(Number(e.target.value))}
            className="min-h-11"
          />
          <p className="text-[11px] text-muted-foreground">Kalau bulan pendek (Feb), auto pindah ke hari terakhir.</p>
        </div>
      )}

      {(frequency === "weekly" || frequency === "biweekly") && (
        <div className="space-y-1.5">
          <Label>Hari</Label>
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setDayOfWeek(i)}
                className={`min-h-9 rounded-lg text-[11px] font-medium transition-colors ${
                  dayOfWeek === i
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="rec-start">Mulai</Label>
          <Input id="rec-start" name="start_date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="min-h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rec-end">Berakhir (opsional)</Label>
          <Input id="rec-end" name="end_date" type="date" className="min-h-11" />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full gradient-brand text-white hover:opacity-90 min-h-11"
      >
        {isPending ? "Membuat…" : "Buat aturan berulang"}
      </Button>
    </form>
  );
}
