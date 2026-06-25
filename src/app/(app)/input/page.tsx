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
    getTransactions({ limit: 10 }),
  ]);

  return (
    <>
      <TopBar title="Catat Transaksi" />
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        <TransactionForm accounts={accounts} categories={categories} projects={projects} />

        <section>
          <h2 className="text-base md:text-lg font-extrabold tracking-tight inline-flex items-center gap-2 mb-3">
            <span aria-hidden className="block h-5 w-1 rounded-full bg-primary" />
            Transaksi Terbaru
          </h2>
          <div className="rounded-3xl border border-border bg-card shadow-soft px-2 py-1">
            <TransactionList transactions={recent} compact />
          </div>
        </section>
      </div>
    </>
  );
}
