-- 0008_recurring.sql
-- Recurring transaction rules — covers Indonesian common patterns (monthly
-- salary, biweekly, weekly, yearly) without bringing rrule.js into the bundle.
-- Generation strategy: server action materializes transactions ahead of time,
-- triggered by app layout on user visit. last_generated_until tracks idempotency.

create table if not exists public.recurring_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,

  type text not null check (type in ('income', 'expense')),
  amount numeric(15,2) not null check (amount > 0),
  description text,

  frequency text not null check (frequency in ('weekly', 'biweekly', 'monthly', 'yearly')),
  -- For weekly/biweekly: 0=Sunday..6=Saturday (matches Postgres EXTRACT(DOW))
  day_of_week int check (day_of_week between 0 and 6),
  -- For monthly: 1..31 (capped to last day of month if shorter)
  day_of_month int check (day_of_month between 1 and 31),
  -- For yearly: anchored to start_date's month + day
  start_date date not null,
  end_date date,

  -- Materialization tracking
  last_generated_until date,
  skip_dates date[] not null default '{}',
  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recurring_rules_user_active_idx
  on public.recurring_rules(user_id, active);

create trigger recurring_rules_updated_at
  before update on public.recurring_rules
  for each row execute function public.set_updated_at();

alter table public.recurring_rules enable row level security;

create policy "recurring_select_own" on public.recurring_rules for select using (auth.uid() = user_id);
create policy "recurring_insert_own" on public.recurring_rules for insert with check (auth.uid() = user_id);
create policy "recurring_update_own" on public.recurring_rules for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "recurring_delete_own" on public.recurring_rules for delete using (auth.uid() = user_id);

-- ============================================================================
-- Link materialized transactions back to their rule (nullable, set null on delete)
-- ============================================================================
alter table public.transactions
  add column if not exists recurring_rule_id uuid
  references public.recurring_rules(id) on delete set null;

create index if not exists transactions_recurring_rule_idx
  on public.transactions(recurring_rule_id)
  where recurring_rule_id is not null;
