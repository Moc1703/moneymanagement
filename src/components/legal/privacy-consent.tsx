"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptPrivacyPolicy } from "@/actions/profile";

export function PrivacyConsent() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function accept() {
    startTransition(async () => {
      const result = await acceptPrivacyPolicy();
      if (result.error) toast.error(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="fixed inset-x-3 bottom-24 md:bottom-6 md:left-auto md:right-6 md:max-w-md z-[55]">
      <div className="rounded-2xl bg-card border border-border shadow-soft-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl gradient-brand text-white shrink-0">
            <Shield className="w-4 h-4" strokeWidth={2.5} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Persetujuan privasi (UU PDP)</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              App ini cuma simpan data keuangan yang lo input sendiri — gak terhubung ke
              bank, gak ada iklan, gak dibagiin ke pihak ketiga. Lo bisa hapus akun + semua
              data kapan saja.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/privacy"
            className="text-xs text-primary hover:underline font-medium"
          >
            Baca lengkap →
          </Link>
          <Button
            onClick={accept}
            disabled={isPending}
            className="gradient-brand text-white hover:opacity-90 min-h-9"
            size="sm"
          >
            {isPending ? "Menyimpan…" : "Setuju & lanjut"}
          </Button>
        </div>
      </div>
    </div>
  );
}
