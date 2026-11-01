-- ---------------------------------------------------------------------------
-- Căn chỉnh ảnh bìa (focal point)
--
-- Chạy một lần trên project đã có schema:
--   node scripts/db.mjs run supabase/post-cover-focus.sql
--
-- Ảnh bìa bị cắt theo khung 4:3 nên ảnh dọc/ngang đều có thể mất sản phẩm.
-- Cột này lưu vị trí tâm ảnh do người bán chọn, ví dụ '50% 30%', và được dùng
-- làm CSS object-position khi hiển thị ở chợ lẫn trang chi tiết.
-- ---------------------------------------------------------------------------

alter table public.posts
  add column if not exists cover_position text not null default '50% 50%';

comment on column public.posts.cover_position is
  'Vị trí tâm ảnh bìa dạng CSS object-position, ví dụ 50% 30%. Người bán tự căn chỉnh.';
