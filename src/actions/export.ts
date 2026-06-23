"use server";

import { getTransactions } from "@/actions/transactions";

export type ExportParams = {
  from?: string;
  to?: string;
  type?: "income" | "expense" | "all";
  accounts?: string[];
  projects?: string[];
  categories?: string[];
  q?: string;
};

function escapeCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // Wrap in quotes if contains separator, newline, or quote — and double-up quotes.
  if (/[;"\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function formatDateID(dateStr: string): string {
  // input: 2026-06-23 → output: 23/06/2026 (Indonesian Excel format)
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export async function exportTransactionsCsv(params: ExportParams): Promise<{ filename: string; csv: string }> {
  const txs = await getTransactions({
    startDate: params.from,
    endDate: params.to,
    search: params.q || undefined,
    limit: 10000,
  });

  const filtered = txs.filter((tx) => {
    if (params.accounts && params.accounts.length > 0 && !params.accounts.includes(tx.account_id)) return false;
    if (params.projects && params.projects.length > 0 && !params.projects.includes(tx.project_id ?? "")) return false;
    if (params.categories && params.categories.length > 0 && !params.categories.includes(tx.category_id)) return false;
    if (params.type && params.type !== "all" && tx.type !== params.type) return false;
    return true;
  });

  const header = [
    "Tanggal",
    "Tipe",
    "Jumlah",
    "Rekening",
    "Kategori",
    "Project",
    "Deskripsi",
  ].join(";");

  const rows = filtered.map((tx) =>
    [
      formatDateID(tx.date),
      tx.type === "income" ? "Pemasukan" : "Pengeluaran",
      Math.round(Number(tx.amount)),
      tx.account?.name ?? "",
      tx.category?.name ?? "",
      tx.project?.name ?? "",
      tx.description ?? "",
    ]
      .map(escapeCell)
      .join(";"),
  );

  // UTF-8 BOM so Excel detects encoding correctly + CRLF line endings (Excel-friendly).
  const csv = "﻿" + [header, ...rows].join("\r\n");

  const filename = `transaksi-${params.from ?? "all"}-${params.to ?? "all"}.csv`;
  return { filename, csv };
}
