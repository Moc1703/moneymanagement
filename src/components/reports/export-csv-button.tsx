"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportTransactionsCsv, type ExportParams } from "@/actions/export";

export function ExportCsvButton({
  params,
  disabled,
}: {
  params: ExportParams;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        const { csv, filename } = await exportTransactionsCsv(params);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("CSV diunduh");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal export CSV");
      }
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={disabled || isPending}
      className="gap-1.5 min-h-9"
    >
      <Download className="w-3.5 h-3.5" />
      {isPending ? "Mengunduh…" : "Export CSV"}
    </Button>
  );
}
