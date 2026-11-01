-- ---------------------------------------------------------------------------
-- Trạng thái tin đăng: chưa bán / đã bán / đã xoá
--
-- Chạy một lần trên project đã có schema:
--   node scripts/db.mjs run supabase/post-status.sql
--
-- Trước đây tin bị xoá hẳn khỏi bảng nên dashboard mất lịch sử đăng tin.
-- Nay mỗi tin luôn tồn tại với 1 trong 3 trạng thái:
--   active  = chưa bán (đang hiện trên chợ)
--   sold    = đã bán   (ẩn khỏi danh sách đang bán, vẫn xem lại được)
--   deleted = đã xoá   (ẩn khỏi chợ, còn trong lịch sử; ghi rõ ai xoá)
-- ---------------------------------------------------------------------------

-- 1. Cho phép trạng thái 'deleted'
alter table public.posts drop constraint if exists posts_status_check;
alter table public.posts
  add constraint posts_status_check check (status in ('active', 'sold', 'deleted'));

-- 2. Ai xoá tin: chính chủ (sinh viên tự xoá) hoặc quản trị viên
alter table public.posts
  add column if not exists deleted_by uuid references public.profiles (id) on delete set null;

alter table public.posts add column if not exists deleted_at timestamptz;

comment on column public.posts.status is
  'active = chưa bán, sold = đã bán, deleted = đã xoá (còn trong lịch sử đăng tin)';
comment on column public.posts.deleted_by is
  'Người xoá tin: trùng owner_id nghĩa là sinh viên tự xoá, khác là quản trị viên xoá';

-- 3. Chuyển các tin đã xoá mềm trước đây sang trạng thái mới
update public.posts
set status = 'deleted'
where deleted_at is not null
  and status <> 'deleted';

create index if not exists posts_status_idx on public.posts (status);
create index if not exists posts_owner_status_idx on public.posts (owner_id, status);
