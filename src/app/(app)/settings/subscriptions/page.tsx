import { TopBar } from "@/components/layout/top-bar";
import { SubscriptionsList } from "@/components/subscriptions/subscriptions-list";
import { EmptyState } from "@/components/ui/empty-state";
import { Sparkles } from "lucide-react";
import { getDetectedSubscriptions } from "@/actions/subscriptions";
import { formatIDR } from "@/lib/utils/format";

export default async function SubscriptionsPage() {
  const [active, dismissed] = await Promise.all([
    getDetectedSubscriptions({ includeDismissed: false }),
    getDetectedSubscriptions({ includeDismissed: true }).then((all) =>
      all.filter((s) => s.dismissed_at !== null),
    ),
  ]);

  const totalMonthly = active.reduce(
    (s, sub) => s + Number(sub.expected_amount) * (30 / sub.interval_days),
    0,
  );

  return (
    <>
      <TopBar
        title="Langganan Terdeteksi"
        subtitle={
          active.length === 0
            ? "Belum ada deteksi"
            : `${active.length} item · ≈ ${formatIDR(totalMonthly)}/bulan`
        }
      />
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        <div className="rounded-2xl bg-primary/5 border border-primary/15 p-4">
          <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            Cara kerja
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            App ngecek transaksi 1 tahun terakhir, nyari pola yang berulang konsisten
            (minimal 3× dengan interval &amp; nominal stabil). Bisa lo abaikan atau confirm
            buat dijadiin aturan berulang.
          </p>
        </div>

        {active.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="w-5 h-5" />}
            title="Belum ada langganan terdeteksi"
            description="Butuh minimal 3 transaksi pengeluaran berulang (deskripsi mirip, interval stabil) buat ke-detect otomatis."
          />
        ) : (
          <SubscriptionsList subs={active} />
        )}

        {dismissed.length > 0 && (
          <details className="rounded-2xl border border-dashed border-border bg-card/40 p-4">
            <summary className="text-xs font-medium text-muted-foreground cursor-pointer select-none">
              {dismissed.length} item diabaikan
            </summary>
            <div className="mt-3">
              <SubscriptionsList subs={dismissed} dismissed />
            </div>
          </details>
        )}
      </div>
    </>
  );
}
