"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, parseIDR, formatIDR } from "@/lib/utils";
import { createTransaction } from "@/actions/transactions";
import type { Account, Category, Project, TransactionType } from "@/lib/types";
import { Save, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export function TransactionForm({
  accounts,
  categories,
  projects,
}: {
  accounts: Account[];
  categories: Category[];
  projects: Project[];
}) {
  const router = useRouter();
  const [type, setType] = useState<TransactionType>("expense");
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [amountDisplay, setAmountDisplay] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === "both"
  );

  const activeProjects = projects.filter((p) => !p.is_archived);
  const umumProject = activeProjects.find((p) => p.is_default);

  function reset() {
    setAmountDisplay("");
    setDescription("");
    setCategoryId("");
    if (umumProject) setProjectId(umumProject.id);
  }

  function handleSubmit(formData: FormData) {
    if (!categoryId) {
      toast.error("Pilih kategori");
      return;
    }
    formData.set("type", type);
    formData.set("account_id", accountId);
    formData.set("category_id", categoryId);
    formData.set("project_id", projectId);
    formData.set("date", date);
    formData.set("amount", String(parseIDR(amountDisplay)));
    formData.set("description", description);

    startTransition(async () => {
      const result = await createTransaction(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Transaksi tersimpan");
        reset();
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <form action={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={cn(
                "flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition",
                type === "expense"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-slate-600"
              )}
            >
              <ArrowUpCircle className="w-4 h-4" />
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={cn(
                "flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition",
                type === "income"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-600"
              )}
            >
              <ArrowDownCircle className="w-4 h-4" />
              Pemasukan
            </button>
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount">Nominal</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">Rp</span>
              <Input
                id="amount"
                inputMode="numeric"
                value={amountDisplay}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setAmountDisplay(raw ? new Intl.NumberFormat("id-ID").format(parseInt(raw)) : "");
                }}
                placeholder="0"
                className="pl-12 text-2xl font-bold h-14"
                autoFocus
              />
            </div>
            {amountDisplay && (
              <p className="text-xs text-slate-500 mt-1">{formatIDR(parseIDR(amountDisplay))}</p>
            )}
          </div>

          {/* Account */}
          <div>
            <Label>Rekening</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => setAccountId(acc.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition",
                    accountId === acc.id
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <span className="text-2xl">{acc.icon}</span>
                  <span className="text-xs font-medium truncate w-full text-center">{acc.name.replace("Rekening ", "")}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <Label>Kategori</Label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition",
                    categoryId === cat.id
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <span
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-lg"
                    style={{ backgroundColor: `${cat.color}30` }}
                  >
                    {cat.icon}
                  </span>
                  <span className="text-[10px] font-medium truncate w-full text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Project */}
          <div>
            <Label>Project</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {activeProjects.map((proj) => (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => setProjectId(proj.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition text-sm",
                    projectId === proj.id
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: proj.color }} />
                  {proj.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date + Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="desc">Catatan (opsional)</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={1}
                className="mt-1"
                placeholder="cth: Makan siang bareng klien"
              />
            </div>
          </div>

          <Button type="submit" disabled={isPending} size="lg" className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {isPending ? "Menyimpan..." : "Simpan Transaksi"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
