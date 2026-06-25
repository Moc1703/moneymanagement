"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const COLOR_OPTIONS = ["#0ea5e9", "#f59e0b", "#8b5cf6", "#10b981", "#ec4899", "#ef4444", "#3b82f6", "#64748b"];

export function ProjectCreateForm({
  action,
}: {
  action: (formData: FormData) => Promise<{ error?: string }>;
}) {
  const [isPending, startTransition] = useTransition();
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  function handleSubmit(formData: FormData) {
    formData.set("color", color);
    startTransition(async () => {
      const result = await action(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Project ditambahkan");
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
            <Label htmlFor="new-proj-name">Nama</Label>
            <Input id="new-proj-name" name="name" required placeholder="cth: Klien Wedding A" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="new-proj-desc">Deskripsi (opsional)</Label>
            <Textarea id="new-proj-desc" name="description" rows={2} />
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
