import { TopBar } from "@/components/layout/top-bar";
import { BudgetRow } from "@/components/budgets/budget-row";
import { EmptyState } from "@/components/ui/empty-state";
import { Wallet } from "lucide-react";
import { getCategories } from "@/actions/categories";
import { getBudgetsForMonth } from "@/actions/budgets";
import { format, startOfMonth } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default async function BudgetsPage() {
  const now = new Date();
  const periodMonth = format(startOfMonth(now), "yyyy-MM-dd");

  const [categories, budgets] = await Promise.all([
    getCategories(),
    getBudgetsForMonth(periodMonth),
  ]);

  const budgetByCategory = new Map(budgets.map((b) => [b.category_id, b]));
  const expenseCategories = categories.filter((c) => c.type === "expense" || c.type === "both");

  return (
    <>
      <TopBar
        title="Kantong"
        subtitle={`Budget bulanan · ${format(startOfMonth(now), "MMMM yyyy", { locale: idLocale })}`}
      />
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-3">
        <div className="rounded-2xl bg-primary/5 border border-primary/15 p-4">
          <p className="text-sm font-medium text-foreground">Cara kerja Kantong</p>
          <p className="text-xs text-muted-foreground mt-1">
            Set limit per kategori. Tiap pengeluaran otomatis ngurangin sisa. Hijau aman, kuning ≥80%, merah lewat.
          </p>
        </div>

        {expenseCategories.length === 0 ? (
          <EmptyState
            icon={<Wallet className="w-5 h-5" />}
            title="Belum ada kategori"
            description="Tambah kategori dulu di Settings → Kategori, baru bisa di-set budget-nya."
            ctaLabel="Buka Kategori"
            ctaHref="/settings/categories"
          />
        ) : (
          <div className="space-y-2.5">
            {expenseCategories.map((cat) => {
              const b = budgetByCategory.get(cat.id);
              return (
                <BudgetRow
                  key={cat.id}
                  category={cat}
                  periodMonth={periodMonth}
                  amount={b ? Number(b.amount) : 0}
                  spent={b ? Number(b.spent) : 0}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
