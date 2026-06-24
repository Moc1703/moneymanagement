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
import { SubscriptionsCard } from "@/components/dashboard/subscriptions-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { CashflowProjectionCard } from "@/components/dashboard/cashflow-projection-card";
import { getAccounts } from "@/actions/accounts";
import { getCategories } from "@/actions/categories";
import { getProjects } from "@/actions/projects";
import { getTransactions } from "@/actions/transactions";
import { getBudgetsForMonth } from "@/actions/budgets";
import { getGoals } from "@/actions/goals";
import { getDetectedSubscriptions } from "@/actions/subscriptions";
import { getRecurringRules } from "@/actions/recurring";
import { buildProjection } from "@/lib/utils/cashflow-projection";
import {
  computeAccountBalances,
  computeTotalBalance,
  buildCashflowByWeek,
  buildExpenseByCategory,
  buildProjectSummary,
  buildSmartInsights,
  buildBalanceSparkline,
} from "@/lib/utils/chart-data";

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {children}
      </h2>
      {action}
    </div>
  );
}

export default async function DashboardPage() {
  const [accounts, categories, projects, transactions, budgets, goals, subs, recurringRules] = await Promise.all([
    getAccounts(),
    getCategories(),
    getProjects(),
    getTransactions({ limit: 200 }),
    getBudgetsForMonth(),
    getGoals(),
    getDetectedSubscriptions(),
    getRecurringRules(),
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
  const activeRules = recurringRules.filter((r) => r.active);
  const projection = buildProjection(totalBalance, activeRules, 12);
  const hasProjection = activeRules.length > 0;
  const sparkline = buildBalanceSparkline(transactions, totalBalance, 30);

  return (
    <>
      <TopBar title="Beranda" subtitle={`${greeting()} 👋`} />
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 md:space-y-10">
        {/* SALDO — hero + per-rekening */}
        <section className="space-y-4">
          <TotalBalanceCard
            balance={totalBalance}
            monthIncome={insights.monthIncome}
            monthExpense={insights.monthExpense}
            sparkline={sparkline}
          />
          <BalanceCards balances={balances} />
        </section>

        {/* QUICK ACTIONS — discoverability untuk semua fitur */}
        <section>
          <QuickActions />
        </section>

        {/* INSIGHT — quick chips */}
        <section>
          <InsightsStrip insights={insights} />
        </section>

        {/* AKTIVITAS — kantong + goals + subscriptions bento */}
        <section>
          <SectionTitle>Aktivitas</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BudgetsOverview budgets={budgets} categoryMap={fullCategoryMap} />
            <GoalsOverview goals={goals} />
          </div>
          {subs.length > 0 && (
            <div className="mt-4">
              <SubscriptionsCard subs={subs} />
            </div>
          )}
        </section>

        {/* CHARTS — cashflow + per-kategori */}
        <section>
          <SectionTitle>Bulan ini</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3">
              <CashflowChart data={cashflow} />
            </div>
            <div className="lg:col-span-2">
              <CategoryPieChart data={expenseByCategory} />
            </div>
          </div>
          <div className="mt-4">
            <ProjectBarChart data={projectSummary} />
          </div>
        </section>

        {/* PROYEKSI — only if recurring rules exist */}
        {hasProjection && (
          <section>
            <SectionTitle>Proyeksi 12 bulan</SectionTitle>
            <CashflowProjectionCard data={projection} />
          </section>
        )}

        {/* RIWAYAT */}
        <section>
          <RecentTransactions transactions={recent} />
        </section>
      </div>
    </>
  );
}
