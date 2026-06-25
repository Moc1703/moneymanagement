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
        <section>
          <h2 className="text-base md:text-lg font-extrabold tracking-tight inline-flex items-center gap-2 mb-3">
            <span aria-hidden className="block h-5 w-1 rounded-full bg-primary" />
            Riwayat Transfer
          </h2>
          <TransferList transfers={transfers} />
        </section>
      </div>
    </>
  );
}
