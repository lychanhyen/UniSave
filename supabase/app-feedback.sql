-- ---------------------------------------------------------------------------
-- Đánh giá và đề xuất cải thiện UniSave
--
-- Chạy một lần:
--   node scripts/db.mjs run supabase/app-feedback.sql
--
-- * Ai cũng ĐỌC được (kể cả khách chưa đăng nhập) — để trang chủ hiển thị
--   "sinh viên nói gì về UniSave" cho người mới có cái nhìn tổng quan.
-- * Chỉ tài khoản đã đăng nhập mới GỬI được, và chỉ gửi thay mặt chính mình.
-- * Người gửi hoặc quản trị viên xoá được; quản trị viên ẩn được bài không phù hợp.
-- ---------------------------------------------------------------------------

create table if not exists public.app_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  author_name text not null default 'Sinh viên UniSave',
  rating smallint not null check (rating between 1 and 5),
  review text not null default '' check (char_length(review) <= 800),
  suggestion text not null default '' check (char_length(suggestion) <= 800),
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now()
);

comment on table public.app_feedback is
  'Đánh giá sao và đề xuất cải thiện sản phẩm, công khai cho mọi người đọc';

create index if not exists app_feedback_created_idx
  on public.app_feedback (created_at desc);
create index if not exists app_feedback_user_idx
  on public.app_feedback (user_id);

alter table public.app_feedback enable row level security;

-- Mọi người đọc được bài đang hiển thị (kể cả khách chưa đăng nhập).
drop policy if exists "feedback readable by everyone" on public.app_feedback;
create policy "feedback readable by everyone" on public.app_feedback
  for select to anon, authenticated using (status = 'visible');

-- Quản trị viên vẫn đọc được cả bài bị ẩn để kiểm duyệt.
drop policy if exists "admins read all feedback" on public.app_feedback;
create policy "admins read all feedback" on public.app_feedback
  for select to authenticated using (public.is_admin());

drop policy if exists "users create own feedback" on public.app_feedback;
create policy "users create own feedback" on public.app_feedback
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "users delete own feedback" on public.app_feedback;
create policy "users delete own feedback" on public.app_feedback
  for delete to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "admins update feedback" on public.app_feedback;
create policy "admins update feedback" on public.app_feedback
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.app_feedback to anon, authenticated;
grant insert, update, delete on public.app_feedback to authenticated;
