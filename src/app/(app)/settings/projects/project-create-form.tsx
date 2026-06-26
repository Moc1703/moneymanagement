"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const COLOR_OPTIONS = [
  "#0ea5e9", "#f59e0b", "#8b5cf6", "#10b981",
  "#ec4899", "#ef4444", "#3b82f6", "#64748b", "#14b8a6", "#f43f5e",
];

export function ProjectCreateForm({
  action,
}: {
  action: (formData: FormData) => Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  function handleSubmit(formData: FormData) {
    formData.set("color", color);
    startTransition(async () => {
      const result = await action(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Project "${name}" ditambahkan 🎉`);
        setName("");
        setColor(COLOR_OPTIONS[0]);
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
        Tambah Project Baru
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
            className="flex items-center justify-center w-12 h-12 rounded-2xl ring-1 ring-inset"
            style={{
              backgroundColor: `${color}1F`,
              color: color,
              boxShadow: `inset 0 0 0 1px ${color}33`,
            }}
          >
            <FolderKanban className="w-5 h-5" strokeWidth={2.5} />
          </span>
          <div>
            <h3 className="text-base font-extrabold tracking-tight">Project baru</h3>
            <p className="text-[11px] text-muted-foreground">Track transaksi per project</p>
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
        <Label htmlFor="new-proj-name" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          Nama
        </Label>
        <Input
          id="new-proj-name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          placeholder="cth: Klien Wedding A, Renovasi rumah"
          className="min-h-11"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="new-proj-desc" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          Deskripsi
        </Label>
        <Textarea id="new-proj-desc" name="description" rows={2} placeholder="Opsional" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          Warna
        </Label>
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
        {isPending ? "Menyimpan…" : "Tambah Project"}
      </Button>
    </form>
  );
}
