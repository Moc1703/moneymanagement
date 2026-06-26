-- 0013_single_default_account.sql
-- Replace handle_new_user trigger so new users get ONLY 1 starter rekening
-- ("Rekening Utama"). Lo bisa tambah/hapus sendiri via Settings → Rekening.
-- Existing users (with 3 seeded accounts) are NOT touched — those rekening
-- tetep ada, mereka bisa archive yang gak dipake.
--
-- Categories and projects seeding unchanged.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 1. Profile
  insert into public.profiles(id, display_name, onboarding_done, mode)
  values (new.id, 'Keluarga', false, 'family');

  -- 2. Single starter account — user can add more, rename, archive
  insert into public.accounts(user_id, name, type, color, icon, sort_order)
  values (new.id, 'Rekening Utama', 'personal', '#7c3aed', '💼', 0);

  -- 3. Default "Umum" project + 3 placeholders
  insert into public.projects(user_id, name, color, is_default, sort_order)
  values
    (new.id, 'Umum',      '#64748b', true,  0),
    (new.id, 'Project 1', '#0ea5e9', false, 1),
    (new.id, 'Project 2', '#f59e0b', false, 2),
    (new.id, 'Project 3', '#8b5cf6', false, 3);

  -- 4. Default categories (universal + Indonesia-specific) — unchanged
  insert into public.categories(user_id, name, type, icon, color, is_default, sort_order) values
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
    (new.id, 'Gaji',           'income',  '💼', '#059669', true, 10),
    (new.id, 'Bonus',          'income',  '🎁', '#eab308', true, 11),
    (new.id, 'Project Income', 'income',  '💰', '#14b8a6', true, 12),
    (new.id, 'Transfer Masuk', 'income',  '↙️', '#94a3b8', true, 13),
    (new.id, 'Lainnya',        'income',  '•',  '#6b7280', true, 14),
    (new.id, 'THR',           'income', '🎉', '#fbbf24', true, 32),
    (new.id, 'Komisi',        'income', '💵', '#14b8a6', true, 33),
    (new.id, 'Hadiah/Angpao', 'income', '🧧', '#ef4444', true, 34);

  return new;
end;
$$;
