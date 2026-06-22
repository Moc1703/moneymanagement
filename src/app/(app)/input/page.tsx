import { getAccounts } from "@/actions/accounts";
import { getCategories } from "@/actions/categories";
import { getProjects } from "@/actions/projects";
import { getTransactions } from "@/actions/transactions";
import { TopBar } from "@/components/layout/top-bar";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionList } from "@/components/transactions/transaction-list";

export default async function InputPage() {
  const [accounts, categories, projects, recent] = await Promise.all([
    getAccounts(),
    getCategories(),
    getProjects(),
    getTransactions({ limit: 20 }),
  ]);

  return (
    <>
      <TopBar title="Input Transaksi" />
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        <TransactionForm
          accounts={accounts}
          categories={categories}
          projects={projects}
        />

        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Transaksi Terbaru</h2>
          <TransactionList transactions={recent} compact />
        </div>
      </div>
    </>
  );
}
