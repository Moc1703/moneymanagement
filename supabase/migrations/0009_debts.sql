-- 0009_debts.sql
-- Hutang / Piutang — informal IOU tracking. Indonesian-specific use case
-- (BukuKas validated this pattern with hundreds of thousands of users).
-- direction = 'owe' (saya pinjam ke orang lain) | 'lent' (mereka pinjam dari saya)
-- A separate ledger of payments tracks partial settlements.

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  counterparty text not null,
  direction text not null check (direction in ('owe', 'lent')),
  principal numeric(15,2) not null check (principal > 0),
  due_date date,
  note text,
  status text not null default 'open' check (status in ('open', 'partial', 'settled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists debts_user_status_idx on public.debts(user_id, status);

create trigger debts_updated_at
  before update on public.debts
  for each row execute function public.set_updated_at();

alter table public.debts enable row level security;

create policy "debts_select_own" on public.debts for select using (auth.uid() = user_id);
create policy "debts_insert_own" on public.debts for insert with check (auth.uid() = user_id);
create policy "debts_update_own" on public.debts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "debts_delete_own" on public.debts for delete using (auth.uid() = user_id);

-- ============================================================================
-- debt_payments — partial/full settlement ledger.
-- Optional link to a transaction (if user records actual cash flow).
-- ============================================================================
create table if not exists public.debt_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  debt_id uuid not null references public.debts(id) on delete cascade,
  transaction_id uuid references public.transactions(id) on delete set null,
  amount numeric(15,2) not null check (amount > 0),
  payment_date date not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists debt_payments_debt_idx on public.debt_payments(debt_id, payment_date desc);

alter table public.debt_payments enable row level security;

create policy "debt_pay_select_own" on public.debt_payments for select using (auth.uid() = user_id);
create policy "debt_pay_insert_own" on public.debt_payments for insert with check (auth.uid() = user_id);
create policy "debt_pay_update_own" on public.debt_payments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "debt_pay_delete_own" on public.debt_payments for delete using (auth.uid() = user_id);

-- ============================================================================
-- View: debt_balance — outstanding per debt
-- ============================================================================
create or replace view public.debt_balance as
select
  d.id            as debt_id,
  d.user_id,
  d.counterparty,
  d.direction,
  d.principal,
  d.due_date,
  d.note,
  d.status,
  d.created_at,
  coalesce(
    (select sum(p.amount)::numeric(15,2)
     from public.debt_payments p
     where p.debt_id = d.id), 0
  ) as paid,
  greatest(
    d.principal - coalesce(
      (select sum(p.amount)::numeric(15,2)
       from public.debt_payments p
       where p.debt_id = d.id), 0
    ),
    0
  ) as outstanding
from public.debts d;

grant select on public.debt_balance to authenticated, anon;

-- ============================================================================
-- Function: settle_debt — atomically add a payment + update status
-- ============================================================================
create or replace function public.settle_debt(
  p_debt_id uuid,
  p_amount numeric,
  p_payment_date date,
  p_note text default null,
  p_transaction_id uuid default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_payment_id uuid;
  v_outstanding numeric;
  v_principal numeric;
  v_total_paid numeric;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  -- Verify debt ownership + grab principal
  select principal into v_principal from public.debts
  where id = p_debt_id and user_id = v_user_id;
  if v_principal is null then
    raise exception 'debt not found';
  end if;

  if p_amount <= 0 then
    raise exception 'payment amount must be positive';
  end if;

  insert into public.debt_payments(user_id, debt_id, transaction_id, amount, payment_date, note)
  values (v_user_id, p_debt_id, p_transaction_id, p_amount, p_payment_date, p_note)
  returning id into v_payment_id;

  -- Recompute total paid, update status
  select coalesce(sum(amount), 0) into v_total_paid
  from public.debt_payments
  where debt_id = p_debt_id;

  update public.debts
  set status = case
    when v_total_paid >= v_principal then 'settled'
    when v_total_paid > 0 then 'partial'
    else 'open'
  end
  where id = p_debt_id;

  return v_payment_id;
end;
$$;

grant execute on function public.settle_debt(uuid, numeric, date, text, uuid) to authenticated;
