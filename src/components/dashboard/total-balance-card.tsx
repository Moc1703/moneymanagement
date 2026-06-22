import { Card, CardContent } from "@/components/ui/card";
import { formatIDR } from "@/lib/utils/format";
import { Wallet } from "lucide-react";

export function TotalBalanceCard({ balance }: { balance: number }) {
  const isNegative = balance < 0;
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-700 border-0 text-white overflow-hidden relative">
      <CardContent className="p-6 relative">
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <Wallet className="w-4 h-4" />
          Total Saldo Gabungan
        </div>
        <p className={`text-3xl md:text-4xl font-bold mt-2 tracking-tight ${isNegative ? "text-red-300" : "text-white"}`}>
          {formatIDR(balance)}
        </p>
        <p className="text-xs text-slate-400 mt-1">3 rekening · update real-time</p>
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-12 w-24 h-24 rounded-full bg-white/5" />
      </CardContent>
    </Card>
  );
}
