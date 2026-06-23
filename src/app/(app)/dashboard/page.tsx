import { TopBar } from "@/components/layout/top-bar";
import { TotalBalanceCard } from "@/components/dashboard/total-balance-card";
import { BalanceCards } from "@/components/dashboard/balance-cards";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { ProjectBarChart } from "@/components/dashboard/project-bar-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { InsightsStrip } from "@/components/dashboard/insights-strip";
import { BudgetsOverview } from "@/components/dashboard/budgets-overview";
import { GoalsOverview } from "@/components/dashboard/goals-overview";
import { getAccounts } from "@/actions/accounts";
import { getCategories } from "@/actions/categories";
import { getProjects } from "@/actions/projects";
import { getTransactions } from "@/actions/transactions";
import { getBudgetsForMonth } from "@/actions/budgets";
import { getGoals } from "@/actions/goals";
import {
  computeAccountBalances,
  computeTotalBalance,
  buildCashflowByWeek,
  buildExpenseByCategory,
  buildProjectSummary,
  buildSmartInsights,
} from "@/lib/utils/chart-data";

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}

export default async function DashboardPage() {
  const [accounts, categories, projects, transactions, budgets, goals] = await Promise.all([
    getAccounts(),
    getCategories(),
    getProjects(),
    getTransactions({ limit: 200 }),
    getBudgetsForMonth(),
    getGoals(),
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
  const insights = buildSmartInsights(transactions, categoryMap);
  const recent = transactions.slice(0, 6);
  const fullCategoryMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <>
      <TopBar title="Beranda" subtitle={`${greeting()} 👋`} />
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-5">
        {/* Hero row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <TotalBalanceCard
              balance={totalBalance}
              monthIncome={insights.monthIncome}
              monthExpense={insights.monthExpense}
            />
          </div>
          <div className="lg:col-span-2">
            <BalanceCards balances={balances} layout="stack" />
          </div>
        </div>

        <InsightsStrip insights={insights} />

        {/* Kantong + Goals bento row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BudgetsOverview budgets={budgets} categoryMap={fullCategoryMap} />
          <GoalsOverview goals={goals} />
        </div>

        {/* Charts bento row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <CashflowChart data={cashflow} />
          </div>
          <div className="lg:col-span-2">
            <CategoryPieChart data={expenseByCategory} />
          </div>
        </div>

        <ProjectBarChart data={projectSummary} />
        <RecentTransactions transactions={recent} />
      </div>
    </>
  );
}
