-- 0006_budgets.sql
-- Kantong / Envelope budgeting — monthly budget per category.
-- One row per (user, category, month). period_month = first day of month.
-- Rollover toggled per-budget; computed at query time, not persisted.

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  period_month date not null,
  amount numeric(15,2) not null check (amount >= 0),
  rollover boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category_id, period_month)
);

create index if not exists budgets_user_period_idx
  on public.budgets (user_id, period_month);

create trigger budgets_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();

alter table public.budgets enable row level security;

create policy "budgets_select_own" on public.budgets for select using (auth.uid() = user_id);
create policy "budgets_insert_own" on public.budgets for insert with check (auth.uid() = user_id);
create policy "budgets_update_own" on public.budgets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "budgets_delete_own" on public.budgets for delete using (auth.uid() = user_id);

-- ============================================================================
-- View: budget progress per (category, month)
-- spent = SUM(transactions where category, type='expense', within month,
--             transfer_group_id IS NULL → exclude transfers)
-- ============================================================================
create or replace view public.budget_progress as
select
  b.id           as budget_id,
  b.user_id,
  b.category_id,
  b.period_month,
  b.amount,
  b.rollover,
  coalesce(
    (select sum(t.amount)::numeric(15,2)
     from public.transactions t
     where t.user_id = b.user_id
       and t.category_id = b.category_id
       and t.type = 'expense'
       and t.transfer_group_id is null
       and t.date >= b.period_month
       and t.date < (b.period_month + interval '1 month')::date
    ), 0
  ) as spent
from public.budgets b;

-- Grant view access (RLS on the underlying budgets table still gates rows).
grant select on public.budget_progress to authenticated, anon;
