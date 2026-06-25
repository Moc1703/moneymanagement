"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Check, Wallet, BarChart3, Plus } from "lucide-react";
import { AppLogo } from "@/components/brand/app-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setInitialBalances, completeOnboarding } from "@/actions/profile";
import { parseIDR } from "@/lib/utils/format";
import type { Account } from "@/lib/types";

type Step = 1 | 2 | 3;

export function OnboardingWizard({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isPending, startTransition] = useTransition();
  const [balances, setBalances] = useState<Record<string, string>>(
    Object.fromEntries(accounts.map((a) => [a.id, new Intl.NumberFormat("id-ID").format(a.initial_balance)])),
  );

  function setBalance(accountId: string, raw: string) {
    const digits = raw.replace(/[^0-9]/g, "");
    const formatted = digits ? new Intl.NumberFormat("id-ID").format(parseInt(digits, 10)) : "";
    setBalances((prev) => ({ ...prev, [accountId]: formatted }));
  }

  function saveBalances() {
    const payload = accounts.map((a) => ({
      accountId: a.id,
      amount: parseIDR(balances[a.id] ?? "0"),
    }));
    startTransition(async () => {
      const result = await setInitialBalances(payload);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setStep(2);
    });
  }

  function finish() {
    startTransition(async () => {
      const result = await completeOnboarding();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Selamat datang! 🎉");
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 overflow-y-auto">
      <div className="min-h-full flex flex-col p-4 sm:p-8">
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
          <header className="text-center mb-6 space-y-3">
            <div className="flex justify-center">
              <AppLogo size={56} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Selamat datang 👋</h1>
              <p className="text-sm text-muted-foreground mt-1">3 langkah singkat biar lo siap pakai</p>
            </div>
          </header>

          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={`h-1.5 rounded-full transition-all ${
                  step === n
                    ? "w-8 bg-primary"
                    : step > n
                      ? "w-6 bg-primary/60"
                      : "w-6 bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex-1 rounded-3xl bg-card border border-border shadow-soft p-5 md:p-6">
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold">Set saldo awal tiap rekening</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Berapa duit yang ada di tiap rekening sekarang? Saldo berjalan dihitung otomatis dari sini + transaksi.
                  </p>
                </div>
                <div className="space-y-3">
                  {accounts.map((acc) => (
                    <div key={acc.id} className="space-y-1.5">
                      <Label htmlFor={`bal-${acc.id}`} className="flex items-center gap-2">
                        <span
                          className="flex items-center justify-center w-7 h-7 rounded-lg text-base"
                          style={{ backgroundColor: `${acc.color}20`, color: acc.color }}
                        >
                          {acc.icon}
                        </span>
                        {acc.name}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                        <Input
                          id={`bal-${acc.id}`}
                          value={balances[acc.id] ?? ""}
                          onChange={(e) => setBalance(acc.id, e.target.value)}
                          inputMode="numeric"
                          placeholder="0"
                          className="pl-10 min-h-11"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={saveBalances}
                  disabled={isPending}
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 min-h-11"
                >
                  {isPending ? "Menyimpan…" : "Lanjut"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold">Cara pakai 🚀</h2>
                  <p className="text-xs text-muted-foreground mt-1">3 hal yang lo perlu tau biar lancar.</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary shrink-0">
                      <Plus className="w-4 h-4" strokeWidth={2.5} />
                    </span>
                    <div>
                      <p className="text-sm font-medium">Input transaksi pake tombol &ldquo;+&rdquo;</p>
                      <p className="text-xs text-muted-foreground">Bottom nav tengah. Pilih rekening, kategori, nominal — beres.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300 shrink-0">
                      <Wallet className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">Pindah duit antar rekening lewat Transfer</p>
                      <p className="text-xs text-muted-foreground">Atomic — saldo dua-duanya update bareng, gak akan setengah-setengah.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300 shrink-0">
                      <BarChart3 className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">Cek arus kas + smart insights di Beranda</p>
                      <p className="text-xs text-muted-foreground">Savings rate, proyeksi pengeluaran, kategori top — semua otomatis.</p>
                    </div>
                  </li>
                </ul>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isPending}
                    className="flex-1 min-h-11"
                  >
                    Kembali
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={isPending}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 min-h-11"
                  >
                    Lanjut
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 text-center">
                <div className="flex justify-center">
                  <span className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                    <Check className="w-8 h-8" strokeWidth={2.5} />
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-semibold">Siap dipakai! 🎉</h2>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    Saldo awal tersimpan. Lo bisa mulai catat transaksi sekarang. Kategori Indonesia (Arisan, THR, BPJS, dll) udah disiapin.
                  </p>
                </div>
                <Button
                  onClick={finish}
                  disabled={isPending}
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 min-h-11"
                >
                  {isPending ? "Memuat…" : "Mulai pakai"}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isPending}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Balik ke panduan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
