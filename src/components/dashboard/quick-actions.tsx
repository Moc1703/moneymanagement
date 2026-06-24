import Link from "next/link";
import { Plus, ArrowLeftRight, Target, PiggyBank, HandCoins, Scale, BarChart3, Repeat } from "lucide-react";

type Action = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tint: string; // text color
  bg: string; // background tint class
};

const ACTIONS: Action[] = [
  {
    href: "/input",
    label: "Catat",
    icon: Plus,
    tint: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-500/15",
  },
  {
    href: "/transfers",
    label: "Transfer",
    icon: ArrowLeftRight,
    tint: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-500/15",
  },
  {
    href: "/goals",
    label: "Goals",
    icon: Target,
    tint: "text-violet-700 dark:text-violet-300",
    bg: "bg-violet-500/15",
  },
  {
    href: "/settings/budgets",
    label: "Kantong",
    icon: PiggyBank,
    tint: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-500/15",
  },
  {
    href: "/debts",
    label: "Hutang",
    icon: HandCoins,
    tint: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-500/15",
  },
  {
    href: "/networth",
    label: "Net Worth",
    icon: Scale,
    tint: "text-cyan-700 dark:text-cyan-300",
    bg: "bg-cyan-500/15",
  },
  {
    href: "/reports",
    label: "Laporan",
    icon: BarChart3,
    tint: "text-indigo-700 dark:text-indigo-300",
    bg: "bg-indigo-500/15",
  },
  {
    href: "/settings/recurring",
    label: "Berulang",
    icon: Repeat,
    tint: "text-pink-700 dark:text-pink-300",
    bg: "bg-pink-500/15",
  },
];

export function QuickActions() {
  return (
    <nav aria-label="Aksi cepat" className="grid grid-cols-4 gap-x-2 gap-y-3 md:grid-cols-8 md:gap-x-3">
      {ACTIONS.map(({ href, label, icon: Icon, tint, bg }) => (
        <Link
          key={href}
          href={href}
          className="group flex flex-col items-center gap-1.5 text-center transition-transform active:scale-95"
        >
          <span
            className={`flex items-center justify-center w-[60px] h-[60px] md:w-16 md:h-16 rounded-2xl ${bg} ${tint} shadow-soft transition-shadow group-hover:shadow-soft-lg`}
          >
            <Icon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2.25} />
          </span>
          <span className="text-[11px] md:text-xs font-semibold text-foreground/85 leading-tight">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
