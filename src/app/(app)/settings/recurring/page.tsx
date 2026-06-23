import { TopBar } from "@/components/layout/top-bar";
import { RecurringForm } from "@/components/recurring/recurring-form";
import { RecurringList } from "@/components/recurring/recurring-list";
import { getRecurringRules } from "@/actions/recurring";
import { getAccounts } from "@/actions/accounts";
import { getCategories } from "@/actions/categories";

export default async function RecurringPage() {
  const [rules, accounts, categories] = await Promise.all([
    getRecurringRules(),
    getAccounts(),
    getCategories(),
  ]);

  return (
    <>
      <TopBar title="Transaksi Berulang" subtitle={`${rules.filter((r) => r.active).length} aktif`} />
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        <div className="rounded-2xl bg-primary/5 border border-primary/15 p-4">
          <p className="text-sm font-medium text-foreground">Cara kerja</p>
          <p className="text-xs text-muted-foreground mt-1">
            App generate transaksi otomatis 30 hari ke depan. Lo bisa edit atau hapus tiap occurrence-nya kalau perlu — aturan tetap jalan.
          </p>
        </div>

        <RecurringList rules={rules} accounts={accounts} categories={categories} />

        <RecurringForm accounts={accounts} categories={categories} />
      </div>
    </>
  );
}
