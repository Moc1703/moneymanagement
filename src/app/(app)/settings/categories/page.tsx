import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { getCategories, createCategory, deleteCategory } from "@/actions/categories";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryForm } from "./category-form";
import { CategoryCreateForm } from "./category-create-form";

export default async function CategoriesPage() {
  const categories = await getCategories();
  const expense = categories.filter((c) => c.type === "expense" || c.type === "both");
  const income = categories.filter((c) => c.type === "income" || c.type === "both");

  return (
    <>
      <TopBar title="Kategori" subtitle={`${categories.length} kategori`} />
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Lainnya
        </Link>

        <Tabs defaultValue="expense">
          <TabsList className="grid w-full grid-cols-2 h-12 p-1 rounded-2xl bg-muted">
            <TabsTrigger
              value="expense"
              className="rounded-xl text-sm font-semibold data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-soft"
            >
              Pengeluaran
            </TabsTrigger>
            <TabsTrigger
              value="income"
              className="rounded-xl text-sm font-semibold data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-soft"
            >
              Pemasukan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expense" className="space-y-2.5 mt-4">
            {expense.map((cat) => (
              <CategoryForm
                key={cat.id}
                category={cat}
                onDelete={async () => {
                  "use server";
                  return deleteCategory(cat.id);
                }}
              />
            ))}
            <CategoryCreateForm type="expense" action={createCategory} />
          </TabsContent>

          <TabsContent value="income" className="space-y-2.5 mt-4">
            {income.map((cat) => (
              <CategoryForm
                key={cat.id}
                category={cat}
                onDelete={async () => {
                  "use server";
                  return deleteCategory(cat.id);
                }}
              />
            ))}
            <CategoryCreateForm type="income" action={createCategory} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
