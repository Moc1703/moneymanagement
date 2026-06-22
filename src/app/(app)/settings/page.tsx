import Link from "next/link";
import { TopBar } from "@/components/layout/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Wallet, Tag, FolderKanban } from "lucide-react";

const items = [
  { href: "/settings/accounts", label: "Rekening", description: "3 rekening: Istri, Pribadi, Usaha", icon: Wallet, color: "bg-blue-100 text-blue-600" },
  { href: "/settings/categories", label: "Kategori", description: "Kategori pemasukan & pengeluaran", icon: Tag, color: "bg-purple-100 text-purple-600" },
  { href: "/settings/projects", label: "Project", description: "Track uang per project usaha", icon: FolderKanban, color: "bg-emerald-100 text-emerald-600" },
];

export default function SettingsPage() {
  return (
    <>
      <TopBar title="Pengaturan" />
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="hover:bg-slate-50 transition-colors">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{item.label}</p>
                    <p className="text-sm text-slate-500 truncate">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
