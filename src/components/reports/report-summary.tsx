import { Card, CardContent } from "@/components/ui/card";
import { formatIDR } from "@/lib/utils/format";
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";

export function ReportSummary({
  income,
  expense,
  net,
}: {
  income: number;
  expense: number;
  net: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Masuk</span>
          </div>
          <p className="text-sm md:text-base font-bold truncate">{formatIDR(income)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 text-red-600 mb-1">
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Keluar</span>
          </div>
          <p className="text-sm md:text-base font-bold truncate">{formatIDR(expense)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 text-slate-600 mb-1">
            <Wallet className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Net</span>
          </div>
          <p
            className={`text-sm md:text-base font-bold truncate ${
              net >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {formatIDR(net)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
