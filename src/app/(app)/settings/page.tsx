import Link from "next/link";
import { TopBar } from "@/components/layout/top-bar";
import { ChevronRight, Wallet, Tag, FolderKanban, Target, HandCoins, Repeat, PiggyBank, Sparkles, Scale, LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";

type Item = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
};

const features: Item[] = [
  { href: "/goals", label: "Tabungan Tujuan", description: "Goal nabung dengan target tanggal & nominal", icon: Target, tint: "bg-violet-500/15 text-violet-600 dark:text-violet-300" },
  { href: "/debts", label: "Hutang & Piutang", description: "Catat pinjaman ke teman/keluarga", icon: HandCoins, tint: "bg-rose-500/15 text-rose-600 dark:text-rose-300" },
  { href: "/networth", label: "Net Worth", description: "Aset (investasi, emas, properti) + hutang besar (KPR, paylater)", icon: Scale, tint: "bg-primary/15 text-primary" },
];

const automation: Item[] = [
  { href: "/settings/budgets", label: "Kantong", description: "Budget bulanan per kategori, progress otomatis", icon: PiggyBank, tint: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
  { href: "/settings/recurring", label: "Transaksi Berulang", description: "Gaji, KPR, langganan — auto-input tiap periode", icon: Repeat, tint: "bg-amber-500/15 text-amber-600 dark:text-amber-300" },
  { href: "/settings/subscriptions", label: "Langganan Terdeteksi", description: "Pola berulang yang otomatis dikenali dari transaksi", icon: Sparkles, tint: "bg-violet-500/15 text-violet-600 dark:text-violet-300" },
];

const config: Item[] = [
  { href: "/settings/accounts", label: "Rekening", description: "Atur rekening, saldo awal, warna", icon: Wallet, tint: "bg-blue-500/15 text-blue-600 dark:text-blue-300" },
  { href: "/settings/categories", label: "Kategori", description: "Kategori pemasukan & pengeluaran", icon: Tag, tint: "bg-purple-500/15 text-purple-600 dark:text-purple-300" },
  { href: "/settings/projects", label: "Project", description: "Track uang per project usaha", icon: FolderKanban, tint: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300" },
];

function Section({ title, items }: { title: string; items: Item[] }) {
  return (
    <section>
      <h2 className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 px-1">{title}</h2>
      <ul className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card shadow-soft hover:shadow-soft-lg transition-shadow min-h-16"
              >
                <span className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${item.tint}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function SettingsPage() {
  return (
    <>
      <TopBar title="Lainnya" subtitle="Fitur, otomasi & pengaturan" />
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
        <Section title="Fitur" items={features} />
        <Section title="Otomasi" items={automation} />
        <Section title="Konfigurasi" items={config} />

        <form action={signOut} className="pt-2">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 min-h-11 rounded-xl border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors md:hidden"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </form>
      </div>
    </>
  );
}
