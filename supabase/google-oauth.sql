-- ---------------------------------------------------------------------------
-- Đăng nhập bằng Google: lấy sẵn tên và ảnh đại diện từ tài khoản Google
--
-- Chạy một lần:
--   node scripts/db.mjs run supabase/google-oauth.sql
--
-- Lưu ý: bản thân Google OAuth phải được bật trong Supabase Dashboard
-- (Authentication > Providers > Google, dán Client ID và Client Secret của
-- Google Cloud Console). Tệp này chỉ cập nhật phần hồ sơ người dùng.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, student_code, campus, avatar_url, verification_status)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      new.email
    ),
    new.raw_user_meta_data ->> 'student_code',
    coalesce(new.raw_user_meta_data ->> 'campus', 'khac'),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture',
      ''
    ),
    'pending'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Tự tạo hồ sơ sinh viên khi có tài khoản mới, kể cả tài khoản tạo bằng Google';
