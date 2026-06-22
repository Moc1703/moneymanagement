import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export formatting utilities so they can be imported from "@/lib/utils"
export { formatIDR, formatIDRCompact, formatDate, formatDateShort, formatDateLong, formatMonth, formatRelative, parseIDR } from "./utils/format";
