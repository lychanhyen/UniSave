-- ---------------------------------------------------------------------------
-- Số liệu công khai của một sinh viên
--
-- Chạy một lần trên project đã có schema:
--   node scripts/db.mjs run supabase/profile-stats.sql
--
-- Trang cá nhân cần đếm tin đã đăng, kèo đã đăng và số báo cáo đã nhận. Bảng
-- reports chỉ cho người báo cáo hoặc quản trị viên đọc, nên không thể đếm trực
-- tiếp từ trình duyệt. Hàm dưới đây chạy với quyền chủ sở hữu (security definer)
-- và chỉ trả về con số tổng hợp, không lộ nội dung báo cáo hay người báo cáo.
-- ---------------------------------------------------------------------------

create or replace function public.profile_public_stats(p_user uuid)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'posts_total', (
      select count(*) from public.posts
      where owner_id = p_user and status <> 'deleted'
    ),
    'posts_active', (
      select count(*) from public.posts
      where owner_id = p_user and status = 'active'
    ),
    'posts_sold', (
      select count(*) from public.posts
      where owner_id = p_user and status = 'sold'
    ),
    'deals_total', (
      select count(*) from public.deals
      where owner_id = p_user
    ),
    'reports_received', (
      select count(*)
      from public.reports r
      where (r.target_type = 'user' and r.target_id = p_user::text)
         or (r.target_type = 'post' and r.target_id in (
              select id::text from public.posts where owner_id = p_user
            ))
         or (r.target_type = 'deal' and r.target_id in (
              select id::text from public.deals where owner_id = p_user
            ))
    )
  );
$$;

revoke all on function public.profile_public_stats(uuid) from public;
grant execute on function public.profile_public_stats(uuid) to authenticated;
