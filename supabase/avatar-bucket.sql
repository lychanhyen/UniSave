-- ---------------------------------------------------------------------------
-- Bucket ảnh đại diện (công khai)
--
-- Chạy một lần trên project đã có schema:
--   node scripts/db.mjs run supabase/avatar-bucket.sql
--
-- Ảnh đại diện là thông tin công khai (hiện trong chợ, kèo gom đơn), nên dùng
-- bucket public giống post-images. Mỗi người chỉ ghi được vào thư mục của mình.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars are readable" on storage.objects;
create policy "avatars are readable" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "users upload own avatar" on storage.objects;
create policy "users upload own avatar" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users update own avatar" on storage.objects;
create policy "users update own avatar" on storage.objects
  for update to authenticated using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users delete own avatar" on storage.objects;
create policy "users delete own avatar" on storage.objects
  for delete to authenticated using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
