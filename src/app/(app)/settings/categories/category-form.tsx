"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ChevronDown, ChevronUp, Lock, Trash2 } from "lucide-react";
import { updateCategory } from "@/actions/categories";
import type { Category } from "@/lib/types";

const COLOR_OPTIONS = ["#f97316", "#3b82f6", "#a855f7", "#ef4444", "#ec4899", "#10b981", "#6366f1", "#64748b", "#059669", "#eab308", "#14b8a6", "#94a3b8"];

export function CategoryForm({
  category,
  onDelete,
}: {
  category: Category;
  onDelete: () => Promise<{ error?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateCategory(category.id, formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Kategori diperbarui");
        setOpen(false);
      }
    });
  }

  async function handleDelete() {
    const result = await onDelete();
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Kategori dihapus");
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-3 p-3 text-left"
        >
          <span
            className="flex items-center justify-center w-9 h-9 rounded-lg text-lg shrink-0"
            style={{ backgroundColor: `${category.color}20` }}
          >
            {category.icon}
          </span>
          <span className="flex-1 font-medium text-sm">{category.name}</span>
          {category.is_default && <Lock className="w-3 h-3 text-muted-foreground" />}
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {open && (
          <form action={handleSubmit} className="px-3 pb-3 space-y-3 border-t border-border/70 pt-3">
            <div className="space-y-1">
              <Label htmlFor={`cat-name-${category.id}`}>Nama</Label>
              <Input id={`cat-name-${category.id}`} name="name" defaultValue={category.name} required disabled={category.is_default} />
            </div>

            <div className="space-y-1">
              <Label>Warna</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <label key={c} className="cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      value={c}
                      defaultChecked={category.color === c}
                      className="sr-only peer"
                      disabled={category.is_default}
                    />
                    <div
                      className="w-7 h-7 rounded-full ring-2 ring-transparent peer-checked:ring-primary peer-checked:ring-offset-2 transition"
                      style={{ backgroundColor: c }}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="submit" size="sm" disabled={isPending || category.is_default} className="flex-1">
                Simpan
              </Button>
              {!category.is_default && (
                <ConfirmDialog
                  trigger={
                    <Button type="button" variant="outline" size="sm" disabled={isPending} aria-label="Hapus" className="min-w-11 min-h-11">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  }
                  title={`Hapus kategori "${category.name}"?`}
                  description="Transaksi yang pakai kategori ini tetap ada, tapi tag kategorinya hilang."
                  confirmLabel="Hapus"
                  tone="destructive"
                  onConfirm={handleDelete}
                />
              )}
            </div>
            {category.is_default && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Lock className="w-3 h-3" /> Kategori default tidak bisa diedit/dihapus
              </p>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
