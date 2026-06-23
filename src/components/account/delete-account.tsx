"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteMyAccount } from "@/actions/profile";

export function DeleteAccount() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();

  const phrase = "HAPUS PERMANEN";
  const canDelete = confirm.trim() === phrase;

  function execute() {
    if (!canDelete) return;
    startTransition(async () => {
      const result = await deleteMyAccount();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Akun dan semua data dihapus permanen");
        setOpen(false);
        router.push("/login");
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-2">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Danger zone</p>
            <p className="text-xs text-muted-foreground mt-1">
              Hapus akun + semua data (transaksi, kategori, goal, kantong, hutang, dll)
              permanen. Aksi ini gak bisa dibatalkan.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          className="border-rose-500/40 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 min-h-11"
        >
          <Trash2 className="w-4 h-4" />
          Hapus akun
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300 shrink-0">
                <Trash2 className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <DialogTitle>Hapus akun permanen?</DialogTitle>
                <DialogDescription className="mt-1">
                  Semua data lo dihapus dari server kami. Aksi ini final.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Sebelum hapus, pastikan lo udah <strong>export CSV</strong> di Laporan kalau
              mau backup. Setelah hapus, gak ada cara recover.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="del-confirm">
                Ketik <code className="px-1 py-0.5 rounded bg-muted text-rose-600 dark:text-rose-300 font-mono text-[11px]">{phrase}</code> untuk konfirmasi
              </Label>
              <Input
                id="del-confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={phrase}
                className="min-h-11 font-mono"
                autoComplete="off"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button
              type="button"
              onClick={execute}
              disabled={!canDelete || isPending}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {isPending ? "Menghapus…" : "Hapus permanen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
