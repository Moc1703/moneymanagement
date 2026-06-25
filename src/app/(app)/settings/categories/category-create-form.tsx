"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ICON_OPTIONS = ["🍜", "🚗", "🛍️", "📑", "🎬", "💊", "📚", "💼", "🎁", "💰", "📦", "🏠", "✈️", "🎮", "☕", "💡"];
const COLOR_OPTIONS = ["#f97316", "#3b82f6", "#a855f7", "#ef4444", "#ec4899", "#10b981", "#6366f1", "#64748b"];

export function CategoryCreateForm({
  type,
  action,
}: {
  type: "income" | "expense";
  action: (formData: FormData) => Promise<{ error?: string }>;
}) {
  const [isPending, startTransition] = useTransition();
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
        toast.success("Kategori ditambahkan");
        // Reset form
        const form = document.querySelector("form") as HTMLFormElement;
        form?.reset();
      }
    });
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form action={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="new-cat-name">Nama</Label>
            <Input id="new-cat-name" name="name" required placeholder="cth: Kopi" />
          </div>

          <div className="space-y-1">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition ${
                    icon === i ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Warna</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full ring-2 ring-offset-2 transition ${
                    color === c ? "ring-primary" : "ring-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Menyimpan..." : "Tambah"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
