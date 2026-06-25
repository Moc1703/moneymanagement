"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn, parseIDR, formatIDR } from "@/lib/utils";
import { createTransaction } from "@/actions/transactions";
import type { Account, Category, Project, TransactionType } from "@/lib/types";
import { ArrowDownCircle, ArrowUpCircle, Calendar, Check, Pencil } from "lucide-react";

const QUICK_AMOUNTS = [10000, 25000, 50000, 100000, 200000, 500000];

function todayIso() {
  return new Date().toISOString().split("T")[0];
}
function yesterdayIso() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

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
  const [date, setDate] = useState<string>(todayIso());
  const [amountDisplay, setAmountDisplay] = useState("");
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredCategories = categories.filter((c) => c.type === type || c.type === "both");
  const activeProjects = projects.filter((p) => !p.is_archived);
  const umumProject = activeProjects.find((p) => p.is_default);
  const amountValue = parseIDR(amountDisplay);
  const accentColor = type === "expense" ? "oklch(0.62 0.23 25)" : "oklch(0.65 0.17 165)";

  function reset() {
    setAmountDisplay("");
    setDescription("");
    setShowDescription(false);
    setCategoryId("");
    if (umumProject) setProjectId(umumProject.id);
  }

  function setAmountFromRaw(raw: string) {
    const digits = raw.replace(/[^0-9]/g, "");
    setAmountDisplay(digits ? new Intl.NumberFormat("id-ID").format(parseInt(digits, 10)) : "");
  }

  function addQuickAmount(n: number) {
    const next = (amountValue || 0) + n;
    setAmountDisplay(new Intl.NumberFormat("id-ID").format(next));
  }

  function handleSubmit(formData: FormData) {
    if (!categoryId) {
      toast.error("Pilih kategori dulu");
      return;
    }
    if (amountValue <= 0) {
      toast.error("Nominal harus lebih dari 0");
      return;
    }
    formData.set("type", type);
    formData.set("account_id", accountId);
    formData.set("category_id", categoryId);
    formData.set("project_id", projectId);
    formData.set("date", date);
    formData.set("amount", String(amountValue));
    formData.set("description", description);

    startTransition(async () => {
      const result = await createTransaction(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Transaksi tersimpan 🎉");
        reset();
        router.refresh();
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {/* Type toggle — segmented control with color fill */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-muted">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={cn(
            "flex items-center justify-center gap-2 min-h-12 rounded-xl font-semibold text-sm transition-all",
            type === "expense"
              ? "bg-rose-500 text-white shadow-soft"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <ArrowUpCircle className="w-4 h-4" />
          Pengeluaran
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={cn(
            "flex items-center justify-center gap-2 min-h-12 rounded-xl font-semibold text-sm transition-all",
            type === "income"
              ? "bg-emerald-500 text-white shadow-soft"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <ArrowDownCircle className="w-4 h-4" />
          Pemasukan
        </button>
      </div>

      {/* Hero amount — focal point */}
      <div
        className="rounded-3xl bg-card border border-border shadow-soft p-6 text-center transition-colors"
        style={{ boxShadow: amountValue > 0 ? `0 8px 28px -12px ${accentColor}40` : undefined }}
      >
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
          {type === "expense" ? "Berapa pengeluarannya?" : "Berapa pemasukannya?"}
        </p>
        <div className="mt-3 flex items-baseline justify-center gap-2">
          <span
            className="text-2xl md:text-3xl font-bold transition-colors"
            style={{ color: amountValue > 0 ? accentColor : "var(--muted-foreground)" }}
          >
            Rp
          </span>
          <input
            inputMode="numeric"
            value={amountDisplay}
            onChange={(e) => setAmountFromRaw(e.target.value)}
            placeholder="0"
            autoFocus
            aria-label="Nominal"
            className="bg-transparent border-0 outline-none w-full max-w-[260px] text-center font-extrabold tracking-tight tabular-nums text-[2.75rem] md:text-6xl leading-none transition-colors placeholder:text-muted-foreground/40 caret-primary"
            style={{ color: amountValue > 0 ? accentColor : undefined }}
          />
        </div>
        {/* Quick add chips */}
        <div className="mt-5 flex flex-wrap justify-center gap-1.5">
          {QUICK_AMOUNTS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => addQuickAmount(n)}
              className="rounded-full bg-muted hover:bg-accent text-foreground/80 px-3 py-1.5 text-xs font-semibold transition-colors min-h-8"
            >
              +{n >= 1000 ? `${n / 1000}rb` : n}
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

      {/* Account picker — chunky tiles with account color strip */}
      <div className="space-y-2.5">
        <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Dari Rekening</Label>
        <div className="grid grid-cols-3 gap-2">
          {accounts.map((acc) => {
            const selected = accountId === acc.id;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => setAccountId(acc.id)}
                className={cn(
                  "relative overflow-hidden flex flex-col items-center justify-center gap-1.5 rounded-2xl border bg-card p-3 min-h-[88px] transition-all",
                  selected
                    ? "border-transparent shadow-soft-lg ring-2"
                    : "border-border shadow-soft hover:shadow-soft-lg",
                )}
                style={selected ? { ["--tw-ring-color" as string]: acc.color } : undefined}
              >
                <span
                  aria-hidden
                  className="absolute top-0 left-0 right-0 h-1 transition-opacity"
                  style={{ backgroundColor: acc.color, opacity: selected ? 1 : 0.3 }}
                />
                <span
                  className="flex items-center justify-center w-9 h-9 rounded-xl text-xl transition-colors"
                  style={{
                    backgroundColor: selected ? `${acc.color}26` : `${acc.color}14`,
                  }}
                >
                  {acc.icon}
                </span>
                <span className="text-xs font-semibold leading-tight text-center">
                  {acc.name.replace("Rekening ", "")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category picker — color-tinted tiles, fill with category color when selected */}
      <div className="space-y-2.5">
        <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
          Kategori {type === "expense" ? "Pengeluaran" : "Pemasukan"}
        </Label>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {filteredCategories.map((cat) => {
            const selected = categoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-2.5 min-h-[80px] transition-all relative",
                  selected
                    ? "border-transparent shadow-soft-lg"
                    : "border-border bg-card hover:shadow-soft",
                )}
                style={
                  selected
                    ? {
                        backgroundColor: `${cat.color}1A`,
                        boxShadow: `inset 0 0 0 2px ${cat.color}`,
                      }
                    : undefined
                }
              >
                <span
                  className="flex items-center justify-center w-9 h-9 rounded-xl text-lg shrink-0"
                  style={{
                    backgroundColor: selected ? cat.color : `${cat.color}1A`,
                    color: selected ? "white" : cat.color,
                  }}
                >
                  {cat.icon}
                </span>
                <span
                  className="text-[10px] font-semibold leading-tight text-center truncate w-full"
                  style={selected ? { color: cat.color } : undefined}
                >
                  {cat.name}
                </span>
                {selected && (
                  <span
                    className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  >
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Project chips */}
      <div className="space-y-2.5">
        <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Project</Label>
        <div className="flex flex-wrap gap-1.5">
          {activeProjects.map((proj) => {
            const selected = projectId === proj.id;
            return (
              <button
                key={proj.id}
                type="button"
                onClick={() => setProjectId(proj.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors min-h-9 border",
                  selected
                    ? "text-white border-transparent shadow-soft"
                    : "bg-card text-foreground/80 border-border hover:bg-muted",
                )}
                style={selected ? { backgroundColor: proj.color } : undefined}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: selected ? "white" : proj.color }}
                />
                {proj.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date — quick chips + native date input */}
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

      {/* Description — collapsed by default, expand on click */}
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
            <Label
              htmlFor="desc"
              className="text-xs uppercase tracking-wider font-semibold text-muted-foreground"
            >
              Catatan
            </Label>
            <input
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="cth: Makan siang sama klien"
              className="w-full rounded-2xl bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 px-4 py-3 text-sm outline-none transition-colors min-h-11"
              autoFocus={!description}
            />
          </>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isPending}
        variant={type === "income" ? "positive" : "default"}
        size="lg"
        className="w-full"
      >
        {isPending ? "Menyimpan…" : `Simpan ${type === "expense" ? "Pengeluaran" : "Pemasukan"} ${amountValue > 0 ? formatIDR(amountValue) : ""}`}
      </Button>
    </form>
  );
}
