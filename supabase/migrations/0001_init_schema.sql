-- 0001_init_schema.sql
-- Initial schema for money management app
-- Tables: profiles, accounts, categories, projects, transactions

create extension if not exists "pgcrypto";

-- ============================================================================
-- profiles: one per auth user, holds display name
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Keluarga',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- accounts: the 3 rekening (atau lebih)
-- ============================================================================
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('personal', 'business')),
  color text not null default '#64748b',
  icon text not null default '💳',
  initial_balance numeric(15,2) not null default 0,
  sort_order int not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index accounts_user_id_idx on public.accounts(user_id);

-- ============================================================================
-- categories: income/expense categories (with defaults)
-- ============================================================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense', 'both')),
  icon text not null default '•',
  color text not null default '#64748b',
  is_default boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index categories_user_id_idx on public.categories(user_id);

-- ============================================================================
-- projects: business projects (Umum is default & undeletable)
-- ============================================================================
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  color text not null default '#64748b',
  is_default boolean not null default false,
  is_archived boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_user_id_idx on public.projects(user_id);

-- ============================================================================
-- transactions: the core table
-- amount is always positive; type ('income'|'expense') determines sign
-- transfer_group_id pairs 2 rows for a transfer
-- ============================================================================
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  category_id uuid not null references public.categories(id) on delete restrict,
  type text not null check (type in ('income', 'expense')),
  amount numeric(15,2) not null check (amount > 0),
  date date not null,
  description text,
  transfer_group_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index transactions_user_id_date_idx
  on public.transactions(user_id, date desc);

create index transactions_account_id_date_idx
  on public.transactions(account_id, date desc);

create index transactions_project_id_date_idx
  on public.transactions(project_id, date desc);

create index transactions_transfer_group_id_idx
  on public.transactions(transfer_group_id)
  where transfer_group_id is not null;

create index transactions_category_id_date_idx
  on public.transactions(category_id, date desc);

-- ============================================================================
-- updated_at trigger (applied to all tables)
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger accounts_updated_at
  before update on public.accounts
  for each row execute function public.set_updated_at();

create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger transactions_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();
