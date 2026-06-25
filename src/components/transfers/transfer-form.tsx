"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowDown, Calendar, ArrowLeftRight, Pencil } from "lucide-react";
import { cn, parseIDR, formatIDR } from "@/lib/utils";
import { createTransfer } from "@/actions/transfers";
import type { Account } from "@/lib/types";

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];

function todayIso() {
  return new Date().toISOString().split("T")[0];
}
function yesterdayIso() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function AccountTile({
  account,
  selected,
  onClick,
}: {
  account: Account;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative overflow-hidden flex flex-col items-center justify-center gap-1.5 rounded-2xl border bg-card p-3 min-h-[88px] transition-all",
        selected ? "border-transparent shadow-soft-lg ring-2" : "border-border shadow-soft hover:shadow-soft-lg",
      )}
      style={selected ? { ["--tw-ring-color" as string]: account.color } : undefined}
    >
      <span
        aria-hidden
        className="absolute top-0 left-0 right-0 h-1 transition-opacity"
        style={{ backgroundColor: account.color, opacity: selected ? 1 : 0.3 }}
      />
      <span
        className="flex items-center justify-center w-9 h-9 rounded-xl text-xl transition-colors"
        style={{ backgroundColor: selected ? `${account.color}26` : `${account.color}14` }}
      >
        {account.icon}
      </span>
      <span className="text-xs font-semibold leading-tight text-center">{account.name.replace("Rekening ", "")}</span>
    </button>
  );
}

export function TransferForm({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const [fromId, setFromId] = useState(accounts[0]?.id ?? "");
  const [toId, setToId] = useState(accounts[1]?.id ?? "");
  const [date, setDate] = useState(todayIso());
  const [amountDisplay, setAmountDisplay] = useState("");
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fromAccount = accounts.find((a) => a.id === fromId);
  const toAccount = accounts.find((a) => a.id === toId);
  const amountValue = parseIDR(amountDisplay);

  function reset() {
    setAmountDisplay("");
    setDescription("");
    setShowDescription(false);
  }

  function setAmountFromRaw(raw: string) {
    const digits = raw.replace(/[^0-9]/g, "");
    setAmountDisplay(digits ? new Intl.NumberFormat("id-ID").format(parseInt(digits, 10)) : "");
  }

  function addQuickAmount(n: number) {
    const next = (amountValue || 0) + n;
    setAmountDisplay(new Intl.NumberFormat("id-ID").format(next));
  }

  function swap() {
    setFromId(toId);
    setToId(fromId);
  }

  function handleSubmit(formData: FormData) {
    if (fromId === toId) {
      toast.error("Rekening asal dan tujuan harus berbeda");
      return;
    }
    if (amountValue <= 0) {
      toast.error("Nominal harus lebih dari 0");
      return;
    }
    formData.set("from_account_id", fromId);
    formData.set("to_account_id", toId);
    formData.set("date", date);
    formData.set("amount", String(amountValue));
    formData.set("description", description);

    startTransition(async () => {
      const result = await createTransfer(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Transfer berhasil 🎉");
        reset();
        router.refresh();
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {/* Visual flow: from → to */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Dari</Label>
          <button
            type="button"
            onClick={swap}
            className="inline-flex items-center gap-1 rounded-full bg-muted hover:bg-accent text-foreground/80 px-2.5 py-1 text-[11px] font-semibold transition-colors min-h-7"
            aria-label="Tukar"
          >
            <ArrowLeftRight className="w-3 h-3" />
            Tukar
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {accounts.map((acc) => (
            <AccountTile
              key={acc.id}
              account={acc}
              selected={fromId === acc.id}
              onClick={() => {
                setFromId(acc.id);
                if (acc.id === toId) {
                  setToId(accounts.find((a) => a.id !== acc.id)?.id ?? "");
                }
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center -my-2">
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border shadow-soft text-primary">
          <ArrowDown className="w-4 h-4" strokeWidth={2.5} />
        </span>
      </div>

      <div className="space-y-2.5">
        <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Ke</Label>
        <div className="grid grid-cols-3 gap-2">
          {accounts
            .filter((a) => a.id !== fromId)
            .map((acc) => (
              <AccountTile
                key={acc.id}
                account={acc}
                selected={toId === acc.id}
                onClick={() => setToId(acc.id)}
              />
            ))}
        </div>
      </div>

      {/* Hero amount */}
      <div className="rounded-3xl bg-card border border-border shadow-soft p-6 text-center">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
          Mau transfer berapa?
        </p>
        <div className="mt-3 flex items-baseline justify-center gap-2">
          <span
            className="text-2xl md:text-3xl font-bold transition-colors"
            style={{ color: amountValue > 0 ? "var(--primary)" : "var(--muted-foreground)" }}
          >
            Rp
          </span>
          <input
            inputMode="numeric"
            value={amountDisplay}
            onChange={(e) => setAmountFromRaw(e.target.value)}
            placeholder="0"
            aria-label="Nominal"
            className="bg-transparent border-0 outline-none w-full max-w-[260px] text-center font-extrabold tracking-tight tabular-nums text-[2.75rem] md:text-6xl leading-none text-primary placeholder:text-muted-foreground/40 caret-primary"
          />
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-1.5">
          {QUICK_AMOUNTS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => addQuickAmount(n)}
              className="rounded-full bg-muted hover:bg-accent text-foreground/80 px-3 py-1.5 text-xs font-semibold transition-colors min-h-8"
            >
              +{n >= 1_000_000 ? `${n / 1_000_000}jt` : `${n / 1000}rb`}
            </button>
          ))}
          {amountDisplay && (
            <button
              type="button"
              onClick={() => setAmountDisplay("")}
              className="rounded-full text-muted-foreground hover:text-rose-600 px-3 py-1.5 text-xs font-semibold transition-colors min-h-8"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Date */}
      <div className="space-y-2.5">
        <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Tanggal</Label>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setDate(todayIso())}
            className={cn(
              "rounded-full px-3.5 py-2 text-xs font-semibold transition-colors min-h-9",
              date === todayIso() ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/80 hover:bg-accent",
            )}
          >
            Hari ini
          </button>
          <button
            type="button"
            onClick={() => setDate(yesterdayIso())}
            className={cn(
              "rounded-full px-3.5 py-2 text-xs font-semibold transition-colors min-h-9",
              date === yesterdayIso() ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/80 hover:bg-accent",
            )}
          >
            Kemarin
          </button>
          <label className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border hover:bg-muted px-3.5 py-2 text-xs font-semibold cursor-pointer min-h-9 transition-colors">
            <Calendar className="w-3.5 h-3.5" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-0 outline-none text-xs font-semibold cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Description collapsible */}
      <div className="space-y-2.5">
        {!showDescription && !description ? (
          <button
            type="button"
            onClick={() => setShowDescription(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Tambah catatan
          </button>
        ) : (
          <>
            <Label htmlFor="t-desc" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Catatan
            </Label>
            <input
              id="t-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="cth: Modal project A"
              className="w-full rounded-2xl bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 px-4 py-3 text-sm outline-none transition-colors min-h-11"
              autoFocus={!description}
            />
          </>
        )}
      </div>

      {/* Preview pill */}
      {fromAccount && toAccount && amountValue > 0 && (
        <div className="rounded-2xl bg-primary/5 border border-primary/15 px-4 py-3 text-sm flex items-center justify-center gap-2 flex-wrap font-semibold">
          <span className="inline-flex items-center gap-1.5">
            {fromAccount.icon} {fromAccount.name.replace("Rekening ", "")}
          </span>
          <ArrowDown className="w-3.5 h-3.5 text-primary -rotate-90" />
          <span className="inline-flex items-center gap-1.5">
            {toAccount.icon} {toAccount.name.replace("Rekening ", "")}
          </span>
          <span className="text-primary tabular-nums">· {formatIDR(amountValue)}</span>
        </div>
      )}

      <Button type="submit" disabled={isPending} variant="default" size="lg" className="w-full">
        {isPending ? "Memproses…" : `Transfer ${amountValue > 0 ? formatIDR(amountValue) : ""}`}
      </Button>
    </form>
  );
}
