-- 0004_indonesia_categories_onboarding.sql
-- Phase 1 additions:
--   1. Add profiles.onboarding_done flag (skip wizard for existing users)
--   2. Seed Indonesia-specific categories (arisan, kondangan, THR, BPJS, paylater, etc)
--   3. Replace handle_new_user trigger so new users get the full Indonesia set
--
-- Idempotent: safe to re-run. Existing categories are NOT duplicated (NOT EXISTS check).

-- ============================================================================
-- 1. profiles.onboarding_done
-- ============================================================================
alter table public.profiles
  add column if not exists onboarding_done boolean not null default false;

-- Existing profiles → mark done (don't show wizard to current users)
update public.profiles set onboarding_done = true where onboarding_done = false;

-- ============================================================================
-- 2. Backfill: add Indonesia categories for all existing users (idempotent)
-- ============================================================================
do $$
declare
  v_user record;
  v_new_categories text[][] := array[
    -- name                  | type      | icon  | color     | sort_order
    array['Arisan',            'expense',  '🎲',   '#f59e0b',  '20'],
    array['Kondangan',         'expense',  '💐',   '#d946ef',  '21'],
    array['Zakat/Infaq',       'expense',  '🕌',   '#10b981',  '22'],
    array['ART',               'expense',  '🧹',   '#06b6d4',  '23'],
    array['BBM',               'expense',  '⛽',   '#f97316',  '24'],
    array['Pulsa/Data',        'expense',  '📱',   '#8b5cf6',  '25'],
    array['Listrik (PLN)',     'expense',  '💡',   '#eab308',  '26'],
    array['Internet',          'expense',  '📶',   '#6366f1',  '27'],
    array['BPJS',              'expense',  '🏥',   '#14b8a6',  '28'],
    array['Cicilan/KPR',       'expense',  '🏠',   '#f43f5e',  '29'],
    array['Paylater',          'expense',  '📲',   '#ef4444',  '30'],
    array['Transfer Keluarga', 'expense',  '👨‍👩‍👧', '#ec4899',  '31'],
    array['THR',               'income',   '🎉',   '#fbbf24',  '32'],
    array['Komisi',            'income',   '💵',   '#14b8a6',  '33'],
    array['Hadiah/Angpao',     'income',   '🧧',   '#ef4444',  '34']
  ];
  v_row text[];
begin
  for v_user in select id from auth.users loop
    foreach v_row slice 1 in array v_new_categories loop
      insert into public.categories(user_id, name, type, icon, color, is_default, sort_order)
      select v_user.id, v_row[1], v_row[2], v_row[3], v_row[4], true, v_row[5]::int
      where not exists (
        select 1 from public.categories
        where user_id = v_user.id
          and name = v_row[1]
          and type = v_row[2]
      );
    end loop;
  end loop;
end $$;

-- ============================================================================
-- 3. Replace handle_new_user trigger function
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 1. Profile (with onboarding flag)
  insert into public.profiles(id, display_name, onboarding_done)
  values (new.id, 'Keluarga', false);

  -- 2. Default accounts (3 rekening)
  insert into public.accounts(user_id, name, type, color, icon, sort_order)
  values
    (new.id, 'Rekening Istri', 'personal', '#ec4899', '👩', 0),
    (new.id, 'Rekening Pribadi', 'personal', '#3b82f6', '🧑', 1),
    (new.id, 'Rekening Usaha', 'business', '#10b981', '🏪', 2);

  -- 3. Default "Umum" project + 3 placeholders
  insert into public.projects(user_id, name, color, is_default, sort_order)
  values
    (new.id, 'Umum',      '#64748b', true,  0),
    (new.id, 'Project 1', '#0ea5e9', false, 1),
    (new.id, 'Project 2', '#f59e0b', false, 2),
    (new.id, 'Project 3', '#8b5cf6', false, 3);

  -- 4. Default categories (universal + Indonesia-specific)
  insert into public.categories(user_id, name, type, icon, color, is_default, sort_order) values
    -- Expense — universal
    (new.id, 'Makan',           'expense', '🍜',   '#f97316', true, 0),
    (new.id, 'Transport',       'expense', '🚗',   '#3b82f6', true, 1),
    (new.id, 'Belanja',         'expense', '🛍️',  '#a855f7', true, 2),
    (new.id, 'Tagihan',         'expense', '📑',   '#ef4444', true, 3),
    (new.id, 'Hiburan',         'expense', '🎬',   '#ec4899', true, 4),
    (new.id, 'Kesehatan',       'expense', '💊',   '#10b981', true, 5),
    (new.id, 'Pendidikan',      'expense', '📚',   '#6366f1', true, 6),
    (new.id, 'Project Expense', 'expense', '📦',   '#64748b', true, 7),
    (new.id, 'Transfer Keluar', 'expense', '↗️',  '#94a3b8', true, 8),
    (new.id, 'Lainnya',         'expense', '•',    '#6b7280', true, 9),
    -- Expense — Indonesia
    (new.id, 'Arisan',            'expense', '🎲',    '#f59e0b', true, 20),
    (new.id, 'Kondangan',         'expense', '💐',    '#d946ef', true, 21),
    (new.id, 'Zakat/Infaq',       'expense', '🕌',    '#10b981', true, 22),
    (new.id, 'ART',               'expense', '🧹',    '#06b6d4', true, 23),
    (new.id, 'BBM',               'expense', '⛽',    '#f97316', true, 24),
    (new.id, 'Pulsa/Data',        'expense', '📱',    '#8b5cf6', true, 25),
    (new.id, 'Listrik (PLN)',     'expense', '💡',    '#eab308', true, 26),
    (new.id, 'Internet',          'expense', '📶',    '#6366f1', true, 27),
    (new.id, 'BPJS',              'expense', '🏥',    '#14b8a6', true, 28),
    (new.id, 'Cicilan/KPR',       'expense', '🏠',    '#f43f5e', true, 29),
    (new.id, 'Paylater',          'expense', '📲',    '#ef4444', true, 30),
    (new.id, 'Transfer Keluarga', 'expense', '👨‍👩‍👧', '#ec4899', true, 31),
    -- Income — universal
    (new.id, 'Gaji',           'income',  '💼', '#059669', true, 10),
    (new.id, 'Bonus',          'income',  '🎁', '#eab308', true, 11),
    (new.id, 'Project Income', 'income',  '💰', '#14b8a6', true, 12),
    (new.id, 'Transfer Masuk', 'income',  '↙️', '#94a3b8', true, 13),
    (new.id, 'Lainnya',        'income',  '•',  '#6b7280', true, 14),
    -- Income — Indonesia
    (new.id, 'THR',           'income', '🎉', '#fbbf24', true, 32),
    (new.id, 'Komisi',        'income', '💵', '#14b8a6', true, 33),
    (new.id, 'Hadiah/Angpao', 'income', '🧧', '#ef4444', true, 34);

  return new;
end;
$$;
