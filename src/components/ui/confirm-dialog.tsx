"use client";

import { useState, useTransition, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  trigger: ReactNode;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "destructive" | "default";
  onConfirm: () => Promise<void> | void;
};

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  tone = "destructive",
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await onConfirm();
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)} className="contents">
        {trigger}
      </span>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span
              className={
                tone === "destructive"
                  ? "flex items-center justify-center w-10 h-10 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-300 shrink-0"
                  : "flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0"
              }
            >
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription className="mt-1">{description}</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className={
              tone === "destructive"
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }
          >
            {isPending ? "Memproses..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
