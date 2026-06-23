import Link from "next/link";
import { TopBar } from "@/components/layout/top-bar";
import { DebtForm } from "@/components/debts/debt-form";
import { DebtList } from "@/components/debts/debt-list";
import { getDebts } from "@/actions/debts";
import { formatIDR } from "@/lib/utils/format";

type SearchParams = Promise<{ tab?: "owe" | "lent" }>;

export default async function DebtsPage(props: { searchParams: SearchParams }) {
  const sp = await props.searchParams;
  const tab: "owe" | "lent" = sp.tab === "lent" ? "lent" : "owe";
  const debts = await getDebts(tab);

  const totalOutstanding = debts
    .filter((d) => d.status !== "settled")
    .reduce((s, d) => s + Number(d.outstanding), 0);

  return (
    <>
      <TopBar
        title="Hutang & Piutang"
        subtitle={`${debts.filter((d) => d.status !== "settled").length} aktif · sisa ${formatIDR(totalOutstanding)}`}
      />
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        <div className="inline-flex w-full p-1 rounded-full bg-muted">
          <Link
            href="/debts?tab=owe"
            className={`flex-1 text-center text-xs font-medium min-h-9 rounded-full flex items-center justify-center transition-colors ${
              tab === "owe" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Saya pinjam
          </Link>
          <Link
            href="/debts?tab=lent"
            className={`flex-1 text-center text-xs font-medium min-h-9 rounded-full flex items-center justify-center transition-colors ${
              tab === "lent" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Dipinjam
          </Link>
        </div>

        <DebtList debts={debts} />

        <DebtForm defaultDirection={tab} />
      </div>
    </>
  );
}
