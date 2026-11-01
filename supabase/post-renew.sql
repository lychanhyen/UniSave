-- ---------------------------------------------------------------------------
-- Làm mới tin đăng (gia hạn hiển thị 7 ngày)
--
-- Chạy một lần trên project đã có schema:
--   node scripts/db.mjs run supabase/post-renew.sql
--
-- Chợ chỉ hiện tin trong 7 ngày. Người bán bấm "Đăng lại tin" để gia hạn:
-- cột bumped_at được đặt lại thời điểm hiện tại, created_at giữ nguyên để
-- quản trị viên còn đối chiếu lịch sử.
-- ---------------------------------------------------------------------------

alter table public.posts add column if not exists bumped_at timestamptz;

comment on column public.posts.bumped_at is
  'Lần gia hạn hiển thị gần nhất. Hạn 7 ngày tính từ bumped_at (nếu có) hoặc created_at.';

create index if not exists posts_bumped_at_idx on public.posts (bumped_at);
