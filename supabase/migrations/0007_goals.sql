-- 0007_goals.sql
-- Tabungan Tujuan — goals with target amount + date, plus a link table
-- so a single transaction can contribute to multiple goals (split).

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(15,2) not null check (target_amount > 0),
  target_date date,
  account_id uuid references public.accounts(id) on delete set null,
  color text not null default '#7c3aed',
  icon text not null default '🎯',
  archived_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists goals_user_id_idx on public.goals(user_id);

create trigger goals_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

alter table public.goals enable row level security;

create policy "goals_select_own" on public.goals for select using (auth.uid() = user_id);
create policy "goals_insert_own" on public.goals for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on public.goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals_delete_own" on public.goals for delete using (auth.uid() = user_id);

-- ============================================================================
-- goal_contributions — link table.
-- Either references an existing transaction (transaction_id) OR is a manual
-- standalone entry (transaction_id NULL, amount + date filled).
-- ============================================================================
create table if not exists public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  transaction_id uuid references public.transactions(id) on delete set null,
  amount numeric(15,2) not null check (amount <> 0),
  contribution_date date not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists goal_contributions_goal_idx
  on public.goal_contributions(goal_id, contribution_date desc);

alter table public.goal_contributions enable row level security;

create policy "goal_contrib_select_own" on public.goal_contributions for select using (auth.uid() = user_id);
create policy "goal_contrib_insert_own" on public.goal_contributions for insert with check (auth.uid() = user_id);
create policy "goal_contrib_update_own" on public.goal_contributions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goal_contrib_delete_own" on public.goal_contributions for delete using (auth.uid() = user_id);

-- ============================================================================
-- View: goal progress (current_amount + remaining + on-track indicator)
-- ============================================================================
create or replace view public.goal_progress as
select
  g.id           as goal_id,
  g.user_id,
  g.name,
  g.target_amount,
  g.target_date,
  g.account_id,
  g.color,
  g.icon,
  g.archived_at,
  coalesce(
    (select sum(c.amount)::numeric(15,2)
     from public.goal_contributions c
     where c.goal_id = g.id), 0
  ) as current_amount,
  case
    when g.target_date is null then null
    when g.target_date <= current_date then 0
    else (g.target_date - current_date)
  end as days_remaining
from public.goals g;

grant select on public.goal_progress to authenticated, anon;
