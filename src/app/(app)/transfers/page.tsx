import { getAccounts } from "@/actions/accounts";
import { getTransfers } from "@/actions/transfers";
import { TopBar } from "@/components/layout/top-bar";
import { TransferForm } from "@/components/transfers/transfer-form";
import { TransferList } from "@/components/transfers/transfer-list";

export default async function TransfersPage() {
  const [accounts, transfers] = await Promise.all([
    getAccounts(),
    getTransfers({ limit: 20 }),
  ]);

  return (
    <>
      <TopBar title="Transfer" />
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        <TransferForm accounts={accounts} />
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Riwayat Transfer</h2>
          <TransferList transfers={transfers} />
        </div>
      </div>
    </>
  );
}
