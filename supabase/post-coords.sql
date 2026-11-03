-- ---------------------------------------------------------------------------
-- Toạ độ cho tin đăng ở chợ (bản đồ Leaflet + OpenStreetMap)
--
-- Chạy một lần trên project đã có schema:
--   node scripts/db.mjs run supabase/post-coords.sql
--
-- Người đăng chọn vị trí trên bản đồ khi đăng tin; chợ có chế độ xem bản đồ.
-- Toạ độ được làm tròn 4 chữ số thập phân (~11m) trước khi lưu để không lộ
-- chính xác phòng ký túc xá nhưng vẫn đủ để người mua tìm tới.
-- ---------------------------------------------------------------------------

alter table public.posts add column if not exists lat double precision;
alter table public.posts add column if not exists lng double precision;

comment on column public.posts.lat is
  'Vĩ độ đã làm tròn 4 chữ số thập phân (~11m). NULL = tin không ghim trên bản đồ.';
comment on column public.posts.lng is
  'Kinh độ đã làm tròn 4 chữ số thập phân (~11m). NULL = tin không ghim trên bản đồ.';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'posts_lat_range' and conrelid = 'public.posts'::regclass
  ) then
    alter table public.posts
      add constraint posts_lat_range check (lat is null or (lat between -90 and 90));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'posts_lng_range' and conrelid = 'public.posts'::regclass
  ) then
    alter table public.posts
      add constraint posts_lng_range check (lng is null or (lng between -180 and 180));
  end if;
end
$$;

-- Chỉ tin có toạ độ mới cần quét khi mở chế độ bản đồ.
create index if not exists posts_coords_idx
  on public.posts (created_at desc)
  where lat is not null and lng is not null;
