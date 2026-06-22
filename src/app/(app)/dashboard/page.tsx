import { TopBar } from "@/components/layout/top-bar";
import { TotalBalanceCard } from "@/components/dashboard/total-balance-card";
import { BalanceCards } from "@/components/dashboard/balance-cards";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { ProjectBarChart } from "@/components/dashboard/project-bar-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { getAccounts } from "@/actions/accounts";
import { getCategories } from "@/actions/categories";
import { getProjects } from "@/actions/projects";
import { getTransactions } from "@/actions/transactions";
import {
  computeAccountBalances,
  computeTotalBalance,
  buildCashflowByWeek,
  buildExpenseByCategory,
  buildProjectSummary,
} from "@/lib/utils/chart-data";

export default async function DashboardPage() {
  const [accounts, categories, projects, transactions] = await Promise.all([
    getAccounts(),
    getCategories(),
    getProjects(),
    getTransactions({ limit: 200 }),
  ]);

  const balances = computeAccountBalances(accounts, transactions);
  const totalBalance = computeTotalBalance(balances);
  const cashflow = buildCashflowByWeek(transactions, 8);
  const categoryMap = new Map(
    categories.map((c) => [c.id, { name: c.name, color: c.color, icon: c.icon }])
  );
  const projectMap = new Map(
    projects.map((p) => [p.id, { name: p.name, color: p.color }])
  );
  const expenseByCategory = buildExpenseByCategory(transactions, categoryMap);
  const projectSummary = buildProjectSummary(transactions, projectMap);
  const recent = transactions.slice(0, 8);

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <TotalBalanceCard balance={totalBalance} />
        <BalanceCards balances={balances} />
        <CashflowChart data={cashflow} />
        <CategoryPieChart data={expenseByCategory} />
        <ProjectBarChart data={projectSummary} />
        <RecentTransactions transactions={recent} />
      </div>
    </>
  );
}
