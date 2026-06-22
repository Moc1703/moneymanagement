import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { getAccounts, createAccount, updateAccount, archiveAccount } from "@/actions/accounts";
import { formatIDR, parseIDR } from "@/lib/utils/format";
import { AccountForm } from "./account-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default async function AccountsPage() {
  const accounts = await getAccounts();

  return (
    <>
      <TopBar title="Rekening" />
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        <div className="space-y-2">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg text-xl shrink-0"
                  style={{ backgroundColor: `${account.color}20` }}
                >
                  {account.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{account.name}</p>
                  <p className="text-sm text-slate-500">
                    {account.type === "business" ? "Usaha" : "Pribadi"} · Saldo awal {formatIDR(account.initial_balance)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="border-t border-slate-200 pt-4 mt-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Edit Rekening</h2>
          {accounts.map((account) => (
            <AccountForm
              key={account.id}
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
          ))}
        </div>
      </div>
    </>
  );
}
