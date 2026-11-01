-- ---------------------------------------------------------------------------
-- Quản trị viên không đăng tin / tạo kèo
--
-- Chạy một lần trên project đã có schema:
--   node scripts/db.mjs run supabase/admin-no-posting.sql
--
-- Trước đây can_post() trả true cho cả admin, nên admin vẫn chèn được bài đăng
-- và kèo gom đơn. Nay chỉ sinh viên đã xác minh mới đăng được; admin chỉ duyệt.
-- ---------------------------------------------------------------------------

create or replace function public.can_post()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and is_locked = false
      and is_verified = true
      and role = 'student'
  );
$$;

revoke all on function public.can_post() from public;
grant execute on function public.can_post() to authenticated;
