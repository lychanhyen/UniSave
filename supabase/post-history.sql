-- ---------------------------------------------------------------------------
-- Lịch sử đăng tin: xoá mềm thay vì xoá hẳn
--
-- Chạy một lần trên project đã có schema:
--   node scripts/db.mjs run supabase/post-history.sql
--
-- Sinh viên xoá tin => chỉ đánh dấu deleted_at, dòng dữ liệu vẫn còn để
-- dashboard hiển thị lịch sử đăng tin và người dùng có thể đăng lại.
-- ---------------------------------------------------------------------------

alter table public.posts add column if not exists deleted_at timestamptz;

comment on column public.posts.deleted_at is
  'Thời điểm người đăng xoá tin. NULL = còn trên chợ. Dùng để lưu lịch sử đăng tin.';

create index if not exists posts_deleted_at_idx
  on public.posts (deleted_at);

create index if not exists posts_owner_created_idx
  on public.posts (owner_id, created_at desc);
