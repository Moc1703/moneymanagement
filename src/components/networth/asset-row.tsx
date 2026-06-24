"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { updateAssetValue, archiveAsset, updateLiabilityBalance, archiveLiability } from "@/actions/networth";
import { parseIDR, formatIDR } from "@/lib/utils/format";

type Common = {
  id: string;
  name: string;
  icon: string;
  color: string;
  archiveLabel: string;
};

export function AssetRow({
  asset,
}: {
  asset: { id: string; name: string; icon: string; color: string; current_value: number; note: string | null };
}) {
  return (
    <ValueRow
      common={{ id: asset.id, name: asset.name, icon: asset.icon, color: asset.color, archiveLabel: "Arsipkan aset" }}
      currentValue={Number(asset.current_value)}
      label="Nilai"
      onUpdate={async (val) => updateAssetValue(asset.id, val)}
      onArchive={async () => archiveAsset(asset.id)}
      note={asset.note}
    />
  );
}

export function LiabilityRow({
  liab,
}: {
  liab: { id: string; name: string; icon: string; color: string; current_balance: number; note: string | null; original_amount: number | null; end_date: string | null };
}) {
  const remaining = liab.original_amount && Number(liab.original_amount) > 0
    ? Math.max(0, Number(liab.original_amount) - Number(liab.current_balance))
    : null;
  return (
    <ValueRow
      common={{ id: liab.id, name: liab.name, icon: liab.icon, color: liab.color, archiveLabel: "Arsipkan hutang" }}
      currentValue={Number(liab.current_balance)}
      label="Sisa"
      onUpdate={async (val) => updateLiabilityBalance(liab.id, val)}
      onArchive={async () => archiveLiability(liab.id)}
      note={liab.note}
      meta={
        liab.original_amount
          ? `Pokok ${formatIDR(Number(liab.original_amount))}${remaining !== null ? ` · sudah ${formatIDR(remaining)}` : ""}${liab.end_date ? ` · sampai ${liab.end_date}` : ""}`
          : null
      }
    />
  );
}

function ValueRow({
  common,
  currentValue,
  label,
  onUpdate,
  onArchive,
  note,
  meta,
}: {
  common: Common;
  currentValue: number;
  label: string;
  onUpdate: (value: number) => Promise<{ error?: string }>;
  onArchive: () => Promise<{ error?: string }>;
  note: string | null;
  meta?: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(new Intl.NumberFormat("id-ID").format(currentValue));
  const [isPending, startTransition] = useTransition();
  const original = new Intl.NumberFormat("id-ID").format(currentValue);
  const dirty = value !== original;

  function save() {
    const raw = parseIDR(value || "0");
    startTransition(async () => {
      const result = await onUpdate(raw);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Disimpan — snapshot otomatis dicatat");
        router.refresh();
      }
    });
  }

  async function archive() {
    const result = await onArchive();
    if (result.error) toast.error(result.error);
    else {
      toast.success("Diarsipkan");
      router.refresh();
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-3 mb-3">
        <span
          className="flex items-center justify-center w-10 h-10 rounded-xl text-lg shrink-0 ring-1 ring-inset"
          style={{
            backgroundColor: `${common.color}1A`,
            color: common.color,
            boxShadow: `inset 0 0 0 1px ${common.color}33`,
          }}
        >
          {common.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">{common.name}</p>
          {(meta || note) && (
            <p className="text-[11px] text-muted-foreground truncate">{meta || note}</p>
          )}
        </div>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <label className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
            {label}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
            <Input
              value={value}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                setValue(raw ? new Intl.NumberFormat("id-ID").format(parseInt(raw, 10)) : "");
              }}
              inputMode="numeric"
              className="pl-10 min-h-11"
            />
          </div>
        </div>
        <Button
          onClick={save}
          disabled={!dirty || isPending}
          className="min-h-11 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Save className="w-4 h-4" />
          Update
        </Button>
        <ConfirmDialog
          trigger={
            <Button
              variant="outline"
              className="min-w-11 min-h-11"
              aria-label={common.archiveLabel}
              disabled={isPending}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          }
          title={common.archiveLabel + "?"}
          description={`"${common.name}" akan disembunyikan. Snapshot tetap tersimpan.`}
          confirmLabel="Arsipkan"
          tone="destructive"
          onConfirm={archive}
        />
      </div>
    </div>
  );
}
