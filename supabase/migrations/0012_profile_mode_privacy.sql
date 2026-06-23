-- 0012_profile_mode_privacy.sql
-- Phase 5: public-ready additions
--   1. profiles.mode — 'family' (default) or 'business' for UMKM rebranding
--   2. profiles.privacy_accepted_at — UU PDP consent timestamp
--   3. delete_my_account() — atomic cascade delete callable by authenticated user

alter table public.profiles
  add column if not exists mode text not null default 'family'
    check (mode in ('family', 'business'));

alter table public.profiles
  add column if not exists privacy_accepted_at timestamptz;

-- Existing single user is implicitly consenting (was created before policy)
update public.profiles set privacy_accepted_at = now()
  where privacy_accepted_at is null;

-- Update handle_new_user to set defaults explicitly
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 1. Profile (mode defaults to family, privacy_accepted_at left null
  --    so new users see the consent banner on first login)
  insert into public.profiles(id, display_name, onboarding_done, mode)
  values (new.id, 'Keluarga', false, 'family');

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

-- ============================================================================
-- delete_my_account() — UU PDP right-to-deletion.
-- Cascades through all owned rows via ON DELETE CASCADE on user_id FKs,
-- then deletes from auth.users (requires SECURITY DEFINER + auth schema access).
-- ============================================================================
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  -- Delete from auth.users — all public tables cascade via FK on user_id.
  delete from auth.users where id = v_user_id;
end;
$$;

grant execute on function public.delete_my_account() to authenticated;
