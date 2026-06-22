// Format angka jadi format Rupiah Indonesia
// 1500000 -> "Rp 1.500.000"
// Pakai titik sebagai pemisah ribuan, no decimal places
export function formatIDR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "Rp 0";
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(n)) return "Rp 0";

  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const formatted = Math.floor(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}Rp ${formatted}`;
}

// Format tanggal jadi "21 Jun 2026"
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Format tanggal jadi "21 Jun" (no year)
export function formatDateShort(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

// Format tanggal jadi "Senin, 21 Juni 2026"
export function formatDateLong(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Format bulan: "Juni 2026"
export function formatMonth(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

// Relative time: "2 jam lalu", "kemarin", "3 hari lalu"
export function formatRelative(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay === 1) return "kemarin";
  if (diffDay < 7) return `${diffDay} hari lalu`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} minggu lalu`;
  return formatDate(d);
}

// Parse string "1500000" atau "1.500.000" jadi number
export function parseIDR(str: string): number {
  return parseInt(str.replace(/[^0-9]/g, ""), 10) || 0;
}

// Compact format untuk chart axis: 1.5jt, 2.3M, dll
export function formatIDRCompact(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "Rp 0";
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(n)) return "Rp 0";

  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";

  if (abs >= 1_000_000_000) return `${sign}Rp ${(abs / 1_000_000_000).toFixed(1)}M`;
  if (abs >= 1_000_000) return `${sign}Rp ${(abs / 1_000_000).toFixed(1)}jt`;
  if (abs >= 1_000) return `${sign}Rp ${(abs / 1_000).toFixed(0)}rb`;
  return `${sign}Rp ${abs}`;
}
