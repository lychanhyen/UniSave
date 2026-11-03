-- ---------------------------------------------------------------------------
-- Thu nhập thêm: nạp thêm ngân sách tháng
--
-- Chạy một lần trên project đã có schema:
--   node scripts/db.mjs run supabase/incomes.sql
--
-- Trước đây ngân sách tháng chỉ là một con số cố định, muốn thêm tiền đi làm
-- thêm thì phải sửa lại tổng và mất dấu khoản nào đã cộng. Nay mỗi khoản thu
-- nhập là một dòng riêng: cộng vào ngân sách tháng, xoá được để trừ ra.
-- ---------------------------------------------------------------------------

create table if not exists public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric not null check (amount > 0),
  source text not null default 'other',
  note text not null default '',
  date date not null default current_date,
  created_at timestamptz not null default now()
);

comment on table public.incomes is
  'Các khoản thu nhập thêm (làm thêm, học bổng, bán đồ...) được cộng vào ngân sách tháng';

create index if not exists incomes_user_date_idx
  on public.incomes (user_id, date desc);

alter table public.incomes enable row level security;

drop policy if exists "users read own incomes" on public.incomes;
create policy "users read own incomes" on public.incomes
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "users insert own incomes" on public.incomes;
create policy "users insert own incomes" on public.incomes
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "users delete own incomes" on public.incomes;
create policy "users delete own incomes" on public.incomes
  for delete to authenticated using (user_id = auth.uid());
