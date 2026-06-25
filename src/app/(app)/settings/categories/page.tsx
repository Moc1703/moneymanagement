import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
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
      <TopBar title="Kategori" />
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        <Tabs defaultValue="expense">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
            <TabsTrigger value="income">Pemasukan</TabsTrigger>
          </TabsList>

          <TabsContent value="expense" className="space-y-2 mt-4">
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
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer p-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg border border-dashed border-border">
                <Plus className="w-4 h-4" />
                Tambah Kategori Pengeluaran
              </summary>
              <div className="mt-2">
                <CategoryCreateForm type="expense" action={createCategory} />
              </div>
            </details>
          </TabsContent>

          <TabsContent value="income" className="space-y-2 mt-4">
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
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer p-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg border border-dashed border-border">
                <Plus className="w-4 h-4" />
                Tambah Kategori Pemasukan
              </summary>
              <div className="mt-2">
                <CategoryCreateForm type="income" action={createCategory} />
              </div>
            </details>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
