import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { getAccounts, updateAccount, archiveAccount } from "@/actions/accounts";
import { AccountForm } from "./account-form";
import { AccountCreateForm } from "./account-create-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Wallet } from "lucide-react";

export default async function AccountsPage() {
  const accounts = await getAccounts();

  return (
    <>
      <TopBar title="Rekening" subtitle={`${accounts.length} rekening aktif`} />
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Lainnya
        </Link>

        <div className="rounded-2xl bg-primary/5 border border-primary/15 p-4">
          <p className="text-sm font-bold text-foreground">Cara kerja Rekening</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Tiap rekening fisik lo (BCA, OVO, Cash, dll) jadi 1 entry di sini.
            Saldo berjalan = saldo awal + pemasukan − pengeluaran. Bisa tambah,
            edit, atau arsipkan kapan aja.
          </p>
        </div>

        <section>
          <h2 className="text-base md:text-lg font-extrabold tracking-tight inline-flex items-center gap-2 mb-3">
            <span aria-hidden className="block h-5 w-1 rounded-full bg-primary" />
            Rekening Aktif
          </h2>
          {accounts.length === 0 ? (
            <EmptyState
              icon={<Wallet className="w-5 h-5" />}
              title="Belum ada rekening"
              description="Tambah rekening pertama lo di bawah biar bisa mulai catat transaksi."
            />
          ) : (
            <ul className="space-y-2.5">
              {accounts.map((account) => (
                <li key={account.id}>
                  <AccountForm
                    account={account}
                    onUpdate={async (formData) => {
                      "use server";
                      return updateAccount(account.id, formData);
                    }}
                    onArchive={async () => {
                      "use server";
                      return archiveAccount(account.id);
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-base md:text-lg font-extrabold tracking-tight inline-flex items-center gap-2 mb-3">
            <span aria-hidden className="block h-5 w-1 rounded-full bg-primary" />
            Tambah Rekening
          </h2>
          <AccountCreateForm />
        </section>
      </div>
    </>
  );
}
