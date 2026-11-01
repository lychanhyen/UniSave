-- ---------------------------------------------------------------------------
-- Thêm cột actor_name cho bảng thông báo
--
-- Chạy một lần trên project đã có schema:
--   node scripts/db.mjs run supabase/notifications-actor-name.sql
--
-- Toàn bộ tầng dữ liệu (api.js, useDeals, useMarketplace, các RPC deal_* và
-- trigger report) đều ghi actor_name, nhưng bảng notifications chưa từng có cột
-- này nên mọi insert đều lỗi 42703 -> PostgREST trả 400 cho người dùng.
--
-- Cột là dữ liệu hiển thị (tên người gây thông báo), không phải khoá ngoại.
-- ---------------------------------------------------------------------------

alter table public.notifications add column if not exists actor_name text not null default '';

comment on column public.notifications.actor_name is
  'Tên hiển thị của người gây thông báo, ví dụ tên sinh viên hoặc "Chủ kèo".';
