import { TopBar } from "@/components/layout/top-bar";
import { ReportFilters } from "@/components/reports/report-filters";
import { ReportSummary } from "@/components/reports/report-summary";
import { ReportChart } from "@/components/reports/report-chart";
import { ReportTable } from "@/components/reports/report-table";
import { SearchBar } from "@/components/reports/search-bar";
import { ExportCsvButton } from "@/components/reports/export-csv-button";
import { getAccounts } from "@/actions/accounts";
import { getCategories } from "@/actions/categories";
import { getProjects } from "@/actions/projects";
import { getTransactions } from "@/actions/transactions";
import { format, startOfMonth, endOfMonth } from "date-fns";

type SearchParams = Promise<{
  from?: string;
  to?: string;
  account?: string | string[];
  project?: string | string[];
  category?: string | string[];
  type?: "income" | "expense" | "all";
  q?: string;
}>;

export default async function ReportsPage(props: { searchParams: SearchParams }) {
  const sp = await props.searchParams;
  const now = new Date();
  const defaultFrom = format(startOfMonth(now), "yyyy-MM-dd");
  const defaultTo = format(endOfMonth(now), "yyyy-MM-dd");

  const from = sp.from || defaultFrom;
  const to = sp.to || defaultTo;
  const accounts_filter = sp.account ? (Array.isArray(sp.account) ? sp.account : [sp.account]) : [];
  const projects_filter = sp.project ? (Array.isArray(sp.project) ? sp.project : [sp.project]) : [];
  const categories_filter = sp.category ? (Array.isArray(sp.category) ? sp.category : [sp.category]) : [];
  const typeFilter = sp.type ?? "all";
  const query = sp.q?.trim() ?? "";

  const [accounts, categories, projects, transactions] = await Promise.all([
    getAccounts(),
    getCategories(),
    getProjects(),
    getTransactions({ startDate: from, endDate: to, limit: 1000, search: query || undefined }),
  ]);

  const filtered = transactions.filter((tx) => {
    if (accounts_filter.length > 0 && !accounts_filter.includes(tx.account_id)) return false;
    if (projects_filter.length > 0 && !projects_filter.includes(tx.project_id ?? "")) return false;
    if (categories_filter.length > 0 && !categories_filter.includes(tx.category_id)) return false;
    if (typeFilter !== "all" && tx.type !== typeFilter) return false;
    return true;
  });

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  const exportParams = {
    from,
    to,
    type: typeFilter,
    accounts: accounts_filter,
    projects: projects_filter,
    categories: categories_filter,
    q: query,
  };

  return (
    <>
      <TopBar title="Laporan" subtitle={query ? `Cari: "${query}"` : `${filtered.length} transaksi`} />
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <SearchBar initial={query} />
        <ReportFilters
          accounts={accounts}
          categories={categories}
          projects={projects}
          defaults={{ from, to, account: accounts_filter, project: projects_filter, category: categories_filter, type: typeFilter }}
        />
        <ReportSummary income={totalIncome} expense={totalExpense} net={totalIncome - totalExpense} />
        <div className="flex justify-end">
          <ExportCsvButton params={exportParams} disabled={filtered.length === 0} />
        </div>
        <ReportChart transactions={filtered} />
        <ReportTable transactions={filtered} />
      </div>
    </>
  );
}
