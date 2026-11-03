-- ---------------------------------------------------------------------------
-- Bình luận chỉ dành cho sinh viên ĐÃ xác minh
--
-- Chạy một lần trên project đã có schema:
--   node scripts/db.mjs run supabase/post-comments-verify.sql
--
-- Trước đó policy dùng public.can_post(), hàm này chỉ đúng cho sinh viên và đã bị
-- siết để quản trị viên không đăng tin — nên admin bấm bình luận bị 403 mà không
-- hiểu vì sao.
--
-- Quy tắc mới, rõ ràng:
--   * đăng nhập, là chính mình, tài khoản không bị khoá;
--   * và đã xác minh sinh viên (hoặc là quản trị viên).
-- Giao diện sẽ báo trước khi người chưa xác minh bấm gửi.
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
        and (p.is_verified = true or p.role = 'admin')
    )
  );
