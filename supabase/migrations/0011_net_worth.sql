-- 0011_net_worth.sql
-- Net worth tracking — assets (reksa dana, emas, properti, kendaraan, lainnya)
-- + liabilities (KPR, KKR, paylater, pinjaman). Cash flows tetap di `accounts`;
-- assets/liabilities tracking wealth, snapshot per perubahan nilai.
--
-- View: net_worth_total = SUM(account balances) + SUM(asset values)
--                        - SUM(liability balances)

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in (
    'savings', 'investment', 'gold', 'property', 'vehicle', 'crypto', 'other'
  )),
  current_value numeric(15,2) not null check (current_value >= 0),
  color text not null default '#10b981',
  icon text not null default '🪙',
  note text,
  archived_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assets_user_id_idx on public.assets(user_id);

create trigger assets_updated_at
  before update on public.assets
  for each row execute function public.set_updated_at();

alter table public.assets enable row level security;

create policy "assets_select_own" on public.assets for select using (auth.uid() = user_id);
create policy "assets_insert_own" on public.assets for insert with check (auth.uid() = user_id);
create policy "assets_update_own" on public.assets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "assets_delete_own" on public.assets for delete using (auth.uid() = user_id);

create table if not exists public.asset_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  value numeric(15,2) not null check (value >= 0),
  snapshot_date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists asset_snapshots_asset_idx
  on public.asset_snapshots(asset_id, snapshot_date desc);

alter table public.asset_snapshots enable row level security;

create policy "asset_snap_select_own" on public.asset_snapshots for select using (auth.uid() = user_id);
create policy "asset_snap_insert_own" on public.asset_snapshots for insert with check (auth.uid() = user_id);
create policy "asset_snap_delete_own" on public.asset_snapshots for delete using (auth.uid() = user_id);

-- ============================================================================
create table if not exists public.liabilities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in (
    'credit_card', 'mortgage', 'loan', 'paylater', 'other'
  )),
  current_balance numeric(15,2) not null check (current_balance >= 0),
  original_amount numeric(15,2),
  interest_rate_pct numeric(5,2),
  end_date date,
  color text not null default '#ef4444',
  icon text not null default '💳',
  note text,
  archived_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists liabilities_user_id_idx on public.liabilities(user_id);

create trigger liabilities_updated_at
  before update on public.liabilities
  for each row execute function public.set_updated_at();

alter table public.liabilities enable row level security;

create policy "liab_select_own" on public.liabilities for select using (auth.uid() = user_id);
create policy "liab_insert_own" on public.liabilities for insert with check (auth.uid() = user_id);
create policy "liab_update_own" on public.liabilities for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "liab_delete_own" on public.liabilities for delete using (auth.uid() = user_id);

create table if not exists public.liability_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  liability_id uuid not null references public.liabilities(id) on delete cascade,
  balance numeric(15,2) not null check (balance >= 0),
  snapshot_date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists liability_snapshots_liab_idx
  on public.liability_snapshots(liability_id, snapshot_date desc);

alter table public.liability_snapshots enable row level security;

create policy "liab_snap_select_own" on public.liability_snapshots for select using (auth.uid() = user_id);
create policy "liab_snap_insert_own" on public.liability_snapshots for insert with check (auth.uid() = user_id);
create policy "liab_snap_delete_own" on public.liability_snapshots for delete using (auth.uid() = user_id);

-- ============================================================================
-- Function: log_asset_snapshot — triggered on assets.current_value change
-- so the timeline is automatic, no separate UI step.
-- ============================================================================
create or replace function public.log_asset_snapshot()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') or (new.current_value is distinct from old.current_value) then
    insert into public.asset_snapshots(user_id, asset_id, value, snapshot_date)
    values (new.user_id, new.id, new.current_value, current_date);
  end if;
  return new;
end;
$$;

drop trigger if exists assets_snapshot_on_change on public.assets;
create trigger assets_snapshot_on_change
  after insert or update of current_value on public.assets
  for each row execute function public.log_asset_snapshot();

create or replace function public.log_liability_snapshot()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') or (new.current_balance is distinct from old.current_balance) then
    insert into public.liability_snapshots(user_id, liability_id, balance, snapshot_date)
    values (new.user_id, new.id, new.current_balance, current_date);
  end if;
  return new;
end;
$$;

drop trigger if exists liabilities_snapshot_on_change on public.liabilities;
create trigger liabilities_snapshot_on_change
  after insert or update of current_balance on public.liabilities
  for each row execute function public.log_liability_snapshot();
