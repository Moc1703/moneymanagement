"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ICON_OPTIONS = [
  "🍜", "🚗", "🛍️", "📑", "🎬", "💊",
  "📚", "💼", "🎁", "💰", "📦", "🏠",
  "✈️", "🎮", "☕", "💡", "💳", "🎯",
];
const COLOR_OPTIONS = [
  "#f97316", "#3b82f6", "#a855f7", "#ef4444",
  "#ec4899", "#10b981", "#6366f1", "#64748b", "#14b8a6", "#f59e0b",
];

export function CategoryCreateForm({
  type,
  action,
}: {
  type: "income" | "expense";
  action: (formData: FormData) => Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  function handleSubmit(formData: FormData) {
    formData.set("type", type);
    formData.set("icon", icon);
    formData.set("color", color);
    startTransition(async () => {
      const result = await action(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Kategori "${name}" ditambahkan 🎉`);
        setName("");
        setOpen(false);
        router.refresh();
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 min-h-14 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        Tambah Kategori {type === "income" ? "Pemasukan" : "Pengeluaran"}
      </button>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="rounded-3xl bg-card border border-border shadow-soft p-5 space-y-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center w-12 h-12 rounded-2xl text-2xl ring-1 ring-inset"
            style={{
              backgroundColor: `${color}1F`,
              color: color,
              boxShadow: `inset 0 0 0 1px ${color}33`,
            }}
          >
            {icon}
          </span>
          <div>
            <h3 className="text-base font-extrabold tracking-tight">
              Kategori {type === "income" ? "Pemasukan" : "Pengeluaran"}
            </h3>
            <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Bikin kategori baru
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setName("");
            setOpen(false);
          }}
          className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
        >
          Batal
        </button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="new-cat-name" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          Nama
        </Label>
        <Input
          id="new-cat-name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          placeholder={type === "income" ? "cth: Freelance, Komisi" : "cth: Kopi, Olahraga"}
          className="min-h-11"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Icon</Label>
        <div className="grid grid-cols-6 gap-1.5">
          {ICON_OPTIONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={cn(
                "h-11 rounded-xl flex items-center justify-center text-xl transition-all",
                icon === i ? "bg-primary/10 ring-2 ring-primary" : "bg-muted hover:bg-accent",
              )}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Warna</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                "w-9 h-9 rounded-full transition-all",
                color === c ? "ring-2 ring-offset-2 ring-foreground" : "",
              )}
              style={{ backgroundColor: c }}
              aria-label={`Warna ${c}`}
            />
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isPending || !name.trim()} size="lg" className="w-full">
        {isPending ? "Menyimpan…" : "Tambah Kategori"}
      </Button>
    </form>
  );
}
