import { TopBar } from "@/components/layout/top-bar";
import { AssetForm } from "@/components/networth/asset-form";
import { LiabilityForm } from "@/components/networth/liability-form";
import { AssetRow, LiabilityRow } from "@/components/networth/asset-row";
import { NetWorthTimeline } from "@/components/networth/networth-timeline";
import { EmptyState } from "@/components/ui/empty-state";
import { Coins, Landmark, Scale } from "lucide-react";
import { getAccounts } from "@/actions/accounts";
import { getAssets, getLiabilities, getAssetSnapshots, getLiabilitySnapshots } from "@/actions/networth";
import { getTransactions } from "@/actions/transactions";
import { computeAccountBalances } from "@/lib/utils/chart-data";
import { buildNetWorthTimeline } from "@/lib/utils/networth-timeline";
import { formatIDR, formatIDRCompact } from "@/lib/utils/format";

export default async function NetWorthPage() {
  const [accounts, assets, liabilities, assetSnaps, liabSnaps, transactions] = await Promise.all([
    getAccounts(),
    getAssets(),
    getLiabilities(),
    getAssetSnapshots(),
    getLiabilitySnapshots(),
    getTransactions({ limit: 1000 }),
  ]);

  const balances = computeAccountBalances(accounts, transactions);
  const accountsTotal = balances.reduce((s, b) => s + b.balance, 0);
  const assetsTotal = assets.reduce((s, a) => s + Number(a.current_value), 0);
  const liabilitiesTotal = liabilities.reduce((s, l) => s + Number(l.current_balance), 0);
  const totalAssets = accountsTotal + assetsTotal;
  const netWorth = totalAssets - liabilitiesTotal;

  const balanceById = new Map(balances.map((b) => [b.account.id, b.balance]));
  const timeline = buildNetWorthTimeline(
    accounts,
    (a) => balanceById.get(a.id) ?? Number(a.initial_balance),
    assetSnaps,
    liabSnaps,
  );

  return (
    <>
      <TopBar title="Net Worth" subtitle={formatIDR(netWorth)} />
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
        {/* Net worth hero */}
        <div className="relative overflow-hidden rounded-3xl gradient-brand text-white shadow-soft-lg p-6">
          <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide uppercase text-white/85">
            <Scale className="w-3.5 h-3.5" />
            Total Net Worth
          </div>
          <p className={`mt-3 text-3xl md:text-4xl font-bold tracking-tight tabular-nums ${netWorth < 0 ? "text-rose-200" : ""}`}>
            {formatIDR(netWorth)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white/12 border border-white/15 p-3">
              <p className="text-[11px] text-white/80">Aset total</p>
              <p className="mt-1 font-semibold tabular-nums">{formatIDRCompact(totalAssets)}</p>
              <p className="text-[10px] text-white/65 mt-0.5">
                Tabungan {formatIDRCompact(accountsTotal)} + investasi/properti {formatIDRCompact(assetsTotal)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/12 border border-white/15 p-3">
              <p className="text-[11px] text-white/80">Hutang total</p>
              <p className="mt-1 font-semibold tabular-nums">{formatIDRCompact(liabilitiesTotal)}</p>
              <p className="text-[10px] text-white/65 mt-0.5">{liabilities.length} item</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-2xl border border-border bg-card shadow-soft">
          <div className="px-4 pt-4 pb-1">
            <h3 className="text-sm font-semibold">Timeline Net Worth</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Snapshot otomatis tiap nilai berubah</p>
          </div>
          <div className="px-2 pb-3">
            <NetWorthTimeline data={timeline} />
          </div>
        </div>

        {/* Assets list */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
              <Coins className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-semibold">Aset ({assets.length})</h2>
            <span className="text-xs text-muted-foreground ml-auto tabular-nums">{formatIDR(assetsTotal)}</span>
          </div>
          {assets.length === 0 ? (
            <EmptyState
              title="Belum ada aset di-track"
              description="Tabungan ada di Rekening. Tambah di sini: reksa dana, emas, properti, kendaraan."
              variant="card"
            />
          ) : (
            <div className="space-y-2.5">
              {assets.map((a) => <AssetRow key={a.id} asset={a} />)}
            </div>
          )}
        </section>

        <AssetForm />

        {/* Liabilities list */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-300">
              <Landmark className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-semibold">Hutang besar ({liabilities.length})</h2>
            <span className="text-xs text-muted-foreground ml-auto tabular-nums">{formatIDR(liabilitiesTotal)}</span>
          </div>
          {liabilities.length === 0 ? (
            <EmptyState
              title="Belum ada hutang dicatat"
              description="KPR, cicilan kendaraan, kartu kredit — biar net worth real. Hutang kecil ke teman di /debts."
              variant="card"
            />
          ) : (
            <div className="space-y-2.5">
              {liabilities.map((l) => <LiabilityRow key={l.id} liab={l} />)}
            </div>
          )}
        </section>

        <LiabilityForm />
      </div>
    </>
  );
}
