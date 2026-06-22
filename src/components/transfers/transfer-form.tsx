"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowRight, Save } from "lucide-react";
import { cn, parseIDR, formatIDR } from "@/lib/utils";
import { createTransfer } from "@/actions/transfers";
import type { Account } from "@/lib/types";

export function TransferForm({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const [fromId, setFromId] = useState(accounts[0]?.id ?? "");
  const [toId, setToId] = useState(accounts[1]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amountDisplay, setAmountDisplay] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  const fromAccount = accounts.find((a) => a.id === fromId);
  const toAccount = accounts.find((a) => a.id === toId);

  function reset() {
    setAmountDisplay("");
    setDescription("");
  }

  function handleSubmit(formData: FormData) {
    if (fromId === toId) {
      toast.error("Rekening asal dan tujuan harus berbeda");
      return;
    }
    formData.set("from_account_id", fromId);
    formData.set("to_account_id", toId);
    formData.set("date", date);
    formData.set("amount", String(parseIDR(amountDisplay)));
    formData.set("description", description);

    startTransition(async () => {
      const result = await createTransfer(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Transfer berhasil");
        reset();
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <form action={handleSubmit} className="space-y-4">
          {/* From / To */}
          <div>
            <Label>Dari</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    setFromId(acc.id);
                    if (acc.id === toId) {
                      setToId(accounts.find((a) => a.id !== acc.id)?.id ?? "");
                    }
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition",
                    fromId === acc.id
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200"
                  )}
                >
                  <span className="text-2xl">{acc.icon}</span>
                  <span className="text-xs font-medium truncate w-full text-center">
                    {acc.name.replace("Rekening ", "")}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center -my-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100">
              <ArrowRight className="w-4 h-4 text-slate-500 rotate-90" />
            </div>
          </div>

          <div>
            <Label>Ke</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {accounts
                .filter((a) => a.id !== fromId)
                .map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setToId(acc.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition",
                      toId === acc.id
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200"
                    )}
                  >
                    <span className="text-2xl">{acc.icon}</span>
                    <span className="text-xs font-medium truncate w-full text-center">
                      {acc.name.replace("Rekening ", "")}
                    </span>
                  </button>
                ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="t-amount">Nominal</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">Rp</span>
              <Input
                id="t-amount"
                inputMode="numeric"
                value={amountDisplay}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setAmountDisplay(raw ? new Intl.NumberFormat("id-ID").format(parseInt(raw)) : "");
                }}
                placeholder="0"
                className="pl-12 text-2xl font-bold h-14"
              />
            </div>
            {amountDisplay && (
              <p className="text-xs text-slate-500 mt-1">{formatIDR(parseIDR(amountDisplay))}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="t-date">Tanggal</Label>
              <Input id="t-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="t-desc">Catatan (opsional)</Label>
              <Textarea
                id="t-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={1}
                className="mt-1"
                placeholder="cth: Modal project A"
              />
            </div>
          </div>

          {/* Preview */}
          {fromAccount && toAccount && amountDisplay && (
            <div className="bg-slate-50 rounded-lg p-3 text-sm flex items-center justify-center gap-2">
              <span>{fromAccount.icon} {fromAccount.name.replace("Rekening ", "")}</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span>{toAccount.icon} {toAccount.name.replace("Rekening ", "")}</span>
              <span className="font-semibold ml-2">{formatIDR(parseIDR(amountDisplay))}</span>
            </div>
          )}

          <Button type="submit" disabled={isPending} size="lg" className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {isPending ? "Memproses..." : "Transfer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
