-- ---------------------------------------------------------------------------
-- Sửa quyền bình luận: mọi tài khoản đang hoạt động đều bình luận được
--
-- Chạy một lần trên project đã có schema:
--   node scripts/db.mjs run supabase/post-comments-policy.sql
--
-- Policy cũ dùng public.can_post() — hàm này chỉ đúng cho sinh viên ĐÃ xác minh
-- (và đã bị siết để admin không đăng tin). Hệ quả: quản trị viên và sinh viên
-- chưa duyệt bấm gửi bình luận bị 403.
--
-- Bình luận là trao đổi công khai, không phải đăng tin, nên chỉ cần:
-- đăng nhập, là chính mình, và tài khoản không bị khoá.
-- ---------------------------------------------------------------------------

drop policy if exists "users write own comments" on public.post_comments;

create policy "users write own comments" on public.post_comments
  for insert to authenticated with check (
    author_id = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.is_locked = false
    )
  );
