import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { GoalRing } from "@/components/goals/goal-ring";
import { ContributeForm } from "@/components/goals/contribute-form";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Archive, ArrowLeft, Calendar } from "lucide-react";
import { getGoal, getGoalContributions, archiveGoal } from "@/actions/goals";
import { formatIDR, formatDate, formatDateShort } from "@/lib/utils/format";

type Params = Promise<{ id: string }>;

function archiveAction(id: string) {
  return async () => {
    "use server";
    await archiveGoal(id);
  };
}

export default async function GoalDetailPage(props: { params: Params }) {
  const { id } = await props.params;
  const goal = await getGoal(id);
  if (!goal) notFound();
  const contributions = await getGoalContributions(id);

  const current = Number(goal.current_amount);
  const target = Number(goal.target_amount);
  const remaining = Math.max(target - current, 0);
  const monthsLeft = goal.target_date
    ? Math.max(
        ((new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)) | 0,
        0,
      )
    : null;
  const perMonth = monthsLeft && monthsLeft > 0 ? remaining / monthsLeft : null;

  return (
    <>
      <TopBar title={goal.name} subtitle={goal.target_date ? `Target ${formatDateShort(goal.target_date)}` : "Tanpa target tanggal"} />
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        <Link
          href="/goals"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-3 h-3" />
          Semua goal
        </Link>

        <div className="rounded-3xl border border-border bg-card shadow-soft p-6">
          <div className="flex flex-col items-center gap-4">
            <GoalRing current={current} target={target} color={goal.color} icon={goal.icon} size="lg" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Terkumpul</p>
              <p className="text-2xl font-bold tabular-nums">{formatIDR(current)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">dari {formatIDR(target)}</p>
            </div>
            {goal.target_date && (
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="rounded-2xl bg-primary/5 border border-primary/15 p-3 text-center">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Sisa</p>
                  <p className="text-sm font-semibold tabular-nums">{formatIDR(remaining)}</p>
                </div>
                <div className="rounded-2xl bg-primary/5 border border-primary/15 p-3 text-center">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {perMonth === null ? "Hari ini target" : "Nabung / bulan"}
                  </p>
                  <p className="text-sm font-semibold tabular-nums">
                    {perMonth === null ? "🎯" : formatIDR(Math.ceil(perMonth))}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <ContributeForm goalId={goal.goal_id} />

        <div className="rounded-2xl border border-border bg-card shadow-soft">
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-sm font-semibold">Riwayat kontribusi</h3>
            <p className="text-[11px] text-muted-foreground">{contributions.length} entri</p>
          </div>
          {contributions.length === 0 ? (
            <p className="px-4 pb-4 text-xs text-muted-foreground">Belum ada kontribusi.</p>
          ) : (
            <ul className="divide-y divide-border/70 px-2 pb-2">
              {contributions.map((c) => {
                const isIn = Number(c.amount) > 0;
                return (
                  <li key={c.id} className="px-2 py-2.5 flex items-center gap-3">
                    <span
                      className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${
                        isIn ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/15 text-rose-600"
                      }`}
                    >
                      {isIn ? "+" : "−"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.note || (isIn ? "Tambah" : "Tarik")}</p>
                      <p className="text-[11px] text-muted-foreground">{formatDate(c.contribution_date)}</p>
                    </div>
                    <p
                      className={`text-sm font-semibold tabular-nums shrink-0 ${
                        isIn ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isIn ? "+" : ""}
                      {formatIDR(Number(c.amount))}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <ConfirmDialog
          trigger={
            <Button variant="outline" className="w-full text-muted-foreground hover:text-rose-600 min-h-11">
              <Archive className="w-4 h-4" /> Arsipkan goal
            </Button>
          }
          title={`Arsipkan goal "${goal.name}"?`}
          description="Goal akan disembunyikan. Kontribusinya tetap tersimpan."
          confirmLabel="Arsipkan"
          tone="destructive"
          onConfirm={archiveAction(goal.goal_id)}
        />
      </div>
    </>
  );
}
