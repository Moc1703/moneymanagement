import type { AccountType, CategoryType } from "./types";

// Default accounts (seeded by handle_new_user trigger)
export const DEFAULT_ACCOUNTS = [
  { name: "Rekening Istri", type: "personal" as AccountType, color: "#ec4899", icon: "👩" },
  { name: "Rekening Pribadi", type: "personal" as AccountType, color: "#3b82f6", icon: "🧑" },
  { name: "Rekening Usaha", type: "business" as AccountType, color: "#10b981", icon: "🏪" },
];

type SeedCategory = { name: string; type: CategoryType; icon: string; color: string };

// Default categories (seeded). Order matters for the picker.
export const DEFAULT_CATEGORIES: SeedCategory[] = [
  // Expense — universal
  { name: "Makan", type: "expense", icon: "🍜", color: "#f97316" },
  { name: "Transport", type: "expense", icon: "🚗", color: "#3b82f6" },
  { name: "Belanja", type: "expense", icon: "🛍️", color: "#a855f7" },
  { name: "Tagihan", type: "expense", icon: "📑", color: "#ef4444" },
  { name: "Hiburan", type: "expense", icon: "🎬", color: "#ec4899" },
  { name: "Kesehatan", type: "expense", icon: "💊", color: "#10b981" },
  { name: "Pendidikan", type: "expense", icon: "📚", color: "#6366f1" },
  { name: "Project Expense", type: "expense", icon: "📦", color: "#64748b" },
  { name: "Transfer Keluar", type: "expense", icon: "↗️", color: "#94a3b8" },
  { name: "Lainnya", type: "expense", icon: "•", color: "#6b7280" },
  // Expense — Indonesia
  { name: "Arisan", type: "expense", icon: "🎲", color: "#f59e0b" },
  { name: "Kondangan", type: "expense", icon: "💐", color: "#d946ef" },
  { name: "Zakat/Infaq", type: "expense", icon: "🕌", color: "#10b981" },
  { name: "ART", type: "expense", icon: "🧹", color: "#06b6d4" },
  { name: "BBM", type: "expense", icon: "⛽", color: "#f97316" },
  { name: "Pulsa/Data", type: "expense", icon: "📱", color: "#8b5cf6" },
  { name: "Listrik (PLN)", type: "expense", icon: "💡", color: "#eab308" },
  { name: "Internet", type: "expense", icon: "📶", color: "#6366f1" },
  { name: "BPJS", type: "expense", icon: "🏥", color: "#14b8a6" },
  { name: "Cicilan/KPR", type: "expense", icon: "🏠", color: "#f43f5e" },
  { name: "Paylater", type: "expense", icon: "📲", color: "#ef4444" },
  { name: "Transfer Keluarga", type: "expense", icon: "👨‍👩‍👧", color: "#ec4899" },
  // Income — universal
  { name: "Gaji", type: "income", icon: "💼", color: "#059669" },
  { name: "Bonus", type: "income", icon: "🎁", color: "#eab308" },
  { name: "Project Income", type: "income", icon: "💰", color: "#14b8a6" },
  { name: "Transfer Masuk", type: "income", icon: "↙️", color: "#94a3b8" },
  { name: "Lainnya", type: "income", icon: "•", color: "#6b7280" },
  // Income — Indonesia
  { name: "THR", type: "income", icon: "🎉", color: "#fbbf24" },
  { name: "Komisi", type: "income", icon: "💵", color: "#14b8a6" },
  { name: "Hadiah/Angpao", type: "income", icon: "🧧", color: "#ef4444" },
];

// Default projects (seeded)
export const DEFAULT_PROJECTS = [
  { name: "Umum", color: "#64748b", is_default: true },
  { name: "Project 1", color: "#0ea5e9", is_default: false },
  { name: "Project 2", color: "#f59e0b", is_default: false },
  { name: "Project 3", color: "#8b5cf6", is_default: false },
];

// Chart color tokens
export const CHART_COLORS = {
  income: "#10b981",
  expense: "#ef4444",
  neutral: "#64748b",
};
