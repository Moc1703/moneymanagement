"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Users, Store } from "lucide-react";
import { setProfileMode } from "@/actions/profile";
import type { ProfileMode } from "@/lib/types";

export function ModeToggle({ current }: { current: ProfileMode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function change(next: ProfileMode) {
    if (next === current || isPending) return;
    startTransition(async () => {
      const result = await setProfileMode(next);
      if (result.error) toast.error(result.error);
      else {
        toast.success(next === "family" ? "Mode keluarga aktif" : "Mode usaha aktif");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Mode penggunaan</p>
      <p className="text-[11px] text-muted-foreground -mt-1">
        Ngubah label & framing — laporan keluarga vs laba/rugi UMKM.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => change("family")}
          disabled={isPending}
          className={`min-h-16 rounded-2xl border p-3 text-left transition-colors ${
            current === "family"
              ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
              : "bg-card border-border hover:bg-muted"
          }`}
        >
          <Users className={`w-4 h-4 mb-1 ${current === "family" ? "text-primary" : "text-muted-foreground"}`} />
          <p className="text-sm font-semibold">Keluarga</p>
          <p className="text-[11px] text-muted-foreground">Cashflow rumah tangga</p>
        </button>
        <button
          type="button"
          onClick={() => change("business")}
          disabled={isPending}
          className={`min-h-16 rounded-2xl border p-3 text-left transition-colors ${
            current === "business"
              ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
              : "bg-card border-border hover:bg-muted"
          }`}
        >
          <Store className={`w-4 h-4 mb-1 ${current === "business" ? "text-primary" : "text-muted-foreground"}`} />
          <p className="text-sm font-semibold">Usaha</p>
          <p className="text-[11px] text-muted-foreground">UMKM laba/rugi sederhana</p>
        </button>
      </div>
    </div>
  );
}
