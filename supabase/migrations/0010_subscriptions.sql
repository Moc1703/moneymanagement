-- 0010_subscriptions.sql
-- Detected recurring spend (langganan, cicilan, tagihan rutin).
-- Populated by server-side TS heuristic on app visits — no ML, no API.
--
-- Detection rule (described in actions/subscriptions.ts):
--   * cluster expense transactions by normalized description
--   * require >= 3 occurrences with consistent interval (weekly/biweekly/
--     monthly/yearly window) and amount stddev < 15%
--   * dismissed_at lets user hide false positives without deleting

create table if not exists public.detected_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Normalized merchant key (lower-cased, digits stripped) used to dedupe
  pattern_key text not null,
  -- Display label (most recent description as-typed by the user)
  display_name text not null,

  expected_amount numeric(15,2) not null,
  amount_stddev_pct numeric(5,2) not null default 0,
  interval_days int not null,
  occurrences int not null,
  confidence numeric(3,2) not null check (confidence between 0 and 1),

  first_seen_date date not null,
  last_seen_date date not null,
  next_expected_date date,

  -- User flow
  dismissed_at timestamptz,
  -- If user already turned this into a recurring_rule
  recurring_rule_id uuid references public.recurring_rules(id) on delete set null,

  detected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, pattern_key)
);

create index if not exists detected_subscriptions_user_idx
  on public.detected_subscriptions(user_id, dismissed_at, last_seen_date desc);

create trigger detected_subscriptions_updated_at
  before update on public.detected_subscriptions
  for each row execute function public.set_updated_at();

alter table public.detected_subscriptions enable row level security;

create policy "subs_select_own"  on public.detected_subscriptions for select using (auth.uid() = user_id);
create policy "subs_insert_own"  on public.detected_subscriptions for insert with check (auth.uid() = user_id);
create policy "subs_update_own"  on public.detected_subscriptions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subs_delete_own"  on public.detected_subscriptions for delete using (auth.uid() = user_id);
