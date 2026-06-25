"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ChevronDown, ChevronUp, Lock, Trash2 } from "lucide-react";
import { updateProject } from "@/actions/projects";
import type { Project } from "@/lib/types";

const COLOR_OPTIONS = ["#0ea5e9", "#f59e0b", "#8b5cf6", "#10b981", "#ec4899", "#ef4444", "#3b82f6", "#64748b"];

export function ProjectForm({
  project,
  onArchive,
}: {
  project: Project;
  onArchive: () => Promise<{ error?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [color, setColor] = useState(project.color);

  function handleSubmit(formData: FormData) {
    formData.set("color", color);
    startTransition(async () => {
      const result = await updateProject(project.id, formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Project diperbarui");
        setOpen(false);
      }
    });
  }

  async function handleArchive() {
    const result = await onArchive();
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Project diarsipkan");
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
            className="flex items-center justify-center w-3 h-9 rounded-full shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <span className="flex-1 font-medium text-sm">{project.name}</span>
          {project.is_default && <Lock className="w-3 h-3 text-muted-foreground" />}
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {open && (
          <form action={handleSubmit} className="px-3 pb-3 space-y-3 border-t border-border/70 pt-3">
            <div className="space-y-1">
              <Label htmlFor={`proj-name-${project.id}`}>Nama</Label>
              <Input
                id={`proj-name-${project.id}`}
                name="name"
                defaultValue={project.name}
                required
                disabled={project.is_default}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor={`proj-desc-${project.id}`}>Deskripsi (opsional)</Label>
              <Textarea
                id={`proj-desc-${project.id}`}
                name="description"
                defaultValue={project.description ?? ""}
                rows={2}
              />
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

            <div className="flex gap-2 pt-1">
              <Button type="submit" size="sm" disabled={isPending || project.is_default} className="flex-1">
                Simpan
              </Button>
              {!project.is_default && (
                <ConfirmDialog
                  trigger={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      aria-label="Arsipkan"
                      className="min-w-11 min-h-11"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  }
                  title={`Arsipkan project "${project.name}"?`}
                  description="Project ini akan disembunyikan. Transaksi yang terkait tetap ada di laporan."
                  confirmLabel="Arsipkan"
                  tone="destructive"
                  onConfirm={handleArchive}
                />
              )}
            </div>
            {project.is_default && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Lock className="w-3 h-3" /> Project Umum tidak bisa diedit/dihapus
              </p>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
