-- 0003_functions_and_triggers.sql
-- Functions: create_transfer (RPC for atomic transfers)
-- Triggers: handle_new_user (auto-seed profile, accounts, categories, projects)

-- ============================================================================
-- create_transfer: atomic 2-row insert for transfer antar rekening
-- ============================================================================
create or replace function public.create_transfer(
  p_from_account_id uuid,
  p_to_account_id uuid,
  p_amount numeric,
  p_date date,
  p_description text default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_group_id uuid := gen_random_uuid();
  v_user_id uuid := auth.uid();
  v_umum_project_id uuid;
  v_out_cat_id uuid;
  v_in_cat_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if p_from_account_id = p_to_account_id then
    raise exception 'from and to accounts must be different';
  end if;

  if p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  -- Verify both accounts belong to the user
  if not exists (
    select 1 from public.accounts
    where id = p_from_account_id and user_id = v_user_id
  ) then
    raise exception 'from account not found';
  end if;

  if not exists (
    select 1 from public.accounts
    where id = p_to_account_id and user_id = v_user_id
  ) then
    raise exception 'to account not found';
  end if;

  -- Find "Umum" project
  select id into v_umum_project_id
  from public.projects
  where user_id = v_user_id and is_default = true
  limit 1;

  -- Find "Transfer Keluar" and "Transfer Masuk" categories
  select id into v_out_cat_id
  from public.categories
  where user_id = v_user_id and name = 'Transfer Keluar' and type = 'expense'
  limit 1;

  select id into v_in_cat_id
  from public.categories
  where user_id = v_user_id and name = 'Transfer Masuk' and type = 'income'
  limit 1;

  -- Fallback: if not seeded yet, use any default category
  if v_out_cat_id is null then
    select id into v_out_cat_id
    from public.categories
    where user_id = v_user_id and type in ('expense', 'both')
    order by is_default desc, sort_order asc
    limit 1;
  end if;

  if v_in_cat_id is null then
    select id into v_in_cat_id
    from public.categories
    where user_id = v_user_id and type in ('income', 'both')
    order by is_default desc, sort_order asc
    limit 1;
  end if;

  -- Insert expense (from) and income (to) in one transaction
  insert into public.transactions(
    user_id, account_id, project_id, category_id,
    type, amount, date, description, transfer_group_id
  ) values (
    v_user_id, p_from_account_id, v_umum_project_id, v_out_cat_id,
    'expense', p_amount, p_date, p_description, v_group_id
  );

  insert into public.transactions(
    user_id, account_id, project_id, category_id,
    type, amount, date, description, transfer_group_id
  ) values (
    v_user_id, p_to_account_id, v_umum_project_id, v_in_cat_id,
    'income', p_amount, p_date, p_description, v_group_id
  );

  return v_group_id;
end;
$$;

grant execute on function public.create_transfer(
  uuid, uuid, numeric, date, text
) to authenticated;

-- ============================================================================
-- handle_new_user: auto-seed on auth user creation
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_default_project_id uuid;
  v_makan_id uuid;
  v_transport_id uuid;
  v_belanja_id uuid;
  v_tagihan_id uuid;
  v_hiburan_id uuid;
  v_kesehatan_id uuid;
  v_pendidikan_id uuid;
  v_project_expense_id uuid;
  v_transfer_out_id uuid;
  v_lainnya_expense_id uuid;
  v_gaji_id uuid;
  v_bonus_id uuid;
  v_project_income_id uuid;
  v_transfer_in_id uuid;
  v_lainnya_income_id uuid;
begin
  -- 1. Create profile
  insert into public.profiles(id, display_name)
  values (new.id, 'Keluarga');

  -- 2. Create default accounts (3 rekening)
  insert into public.accounts(user_id, name, type, color, icon, sort_order)
  values
    (new.id, 'Rekening Istri', 'personal', '#ec4899', '👩', 0),
    (new.id, 'Rekening Pribadi', 'personal', '#3b82f6', '🧑', 1),
    (new.id, 'Rekening Usaha', 'business', '#10b981', '🏪', 2);

  -- 3. Create default "Umum" project
  insert into public.projects(user_id, name, color, is_default, sort_order)
  values (new.id, 'Umum', '#64748b', true, 0)
  returning id into v_default_project_id;

  insert into public.projects(user_id, name, color, is_default, sort_order)
  values
    (new.id, 'Project 1', '#0ea5e9', false, 1),
    (new.id, 'Project 2', '#f59e0b', false, 2),
    (new.id, 'Project 3', '#8b5cf6', false, 3);

  -- 4. Create default categories
  -- Expense
  insert into public.categories(user_id, name, type, icon, color, is_default, sort_order)
  values (new.id, 'Makan', 'expense', '🍜', '#f97316', true, 0)
  returning id into v_makan_id;

  insert into public.categories(user_id, name, type, icon, color, is_default, sort_order)
  values (new.id, 'Transport', 'expense', '🚗', '#3b82f6', true, 1)
  returning id into v_transport_id;

  insert into public.categories(user_id, name, type, icon, color, is_default, sort_order)
  values (new.id, 'Belanja', 'expense', '🛍️', '#a855f7', true, 2)
  returning id into v_belanja_id;

  insert into public.categories(user_id, name, type, icon, color, is_default, sort_order)
  values (new.id, 'Tagihan', 'expense', '📑', '#ef4444', true, 3)
  returning id into v_tagihan_id;

  insert into public.categories(user_id, name, type, icon, color, is_default, sort_order)
  values (new.id, 'Hiburan', 'expense', '🎬', '#ec4899', true, 4)
  returning id into v_hiburan_id;

  insert into public.categories(user_id, name, type, icon, color, is_default, sort_order)
  values (new.id, 'Kesehatan', 'expense', '💊', '#10b981', true, 5)
  returning id into v_kesehatan_id;

  insert into public.categories(user_id, name, type, icon, color, is_default, sort_order)
  values (new.id, 'Pendidikan', 'expense', '📚', '#6366f1', true, 6)
  returning id into v_pendidikan_id;

  insert into public.categories(user_id, name, type, icon, color, is_default, sort_order)
  values (new.id, 'Project Expense', 'expense', '📦', '#64748b', true, 7)
  returning id into v_project_expense_id;

  insert into public.categories(user_id, name, type, icon, color, is_default, sort_order)
  values (new.id, 'Transfer Keluar', 'expense', '↗️', '#94a3b8', true, 8)
  returning id into v_transfer_out_id;

  insert into public.categories(user_id, name, type, icon, color, is_default, sort_order)
  values (new.id, 'Lainnya', 'expense', '•', '#6b7280', true, 9)
  returning id into v_lainnya_expense_id;

  -- Income
  insert into public.categories(user_id, name, type, icon, color, is_default, sort_order)
  values (new.id, 'Gaji', 'income', '💼', '#059669', true, 10)
  returning id into v_gaji_id;

  insert into public.categories(user_id, name, type, icon, color, is_default, sort_order)
  values (new.id, 'Bonus', 'income', '🎁', '#eab308', true, 11)
  returning id into v_bonus_id;

  insert into public.categories(user_id, name, type, icon, color, is_default, sort_order)
  values (new.id, 'Project Income', 'income', '💰', '#14b8a6', true, 12)
  returning id into v_project_income_id;

  insert into public.categories(user_id, name, type, icon, color, is_default, sort_order)
  values (new.id, 'Transfer Masuk', 'income', '↙️', '#94a3b8', true, 13)
  returning id into v_transfer_in_id;

  insert into public.categories(user_id, name, type, icon, color, is_default, sort_order)
  values (new.id, 'Lainnya', 'income', '•', '#6b7280', true, 14)
  returning id into v_lainnya_income_id;

  return new;
end;
$$;

-- Trigger: fire after a new user is created in auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
