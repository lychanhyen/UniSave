-- ---------------------------------------------------------------------------
-- Bình luận cho tin đăng ở chợ sinh viên
--
-- Chạy một lần trên project đã có schema:
--   node scripts/db.mjs run supabase/post-comments.sql
--
-- Ai đã đăng nhập cũng đọc được bình luận; chỉ xoá được bình luận của mình,
-- quản trị viên xoá được mọi bình luận để kiểm duyệt.
-- Chủ tin nhận thông báo khi có người bình luận (trừ khi tự bình luận tin mình).
-- ---------------------------------------------------------------------------

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 600),
  created_at timestamptz not null default now()
);

create index if not exists post_comments_post_idx
  on public.post_comments (post_id, created_at);
create index if not exists post_comments_author_idx
  on public.post_comments (author_id);

alter table public.post_comments enable row level security;

drop policy if exists "comments readable by signed in" on public.post_comments;
create policy "comments readable by signed in" on public.post_comments
  for select to authenticated using (true);

drop policy if exists "users write own comments" on public.post_comments;
create policy "users write own comments" on public.post_comments
  for insert to authenticated with check (author_id = auth.uid() and public.can_post());

drop policy if exists "users delete own comments" on public.post_comments;
create policy "users delete own comments" on public.post_comments
  for delete to authenticated using (author_id = auth.uid() or public.is_admin());

-- Thông báo cho chủ tin khi có bình luận mới
create or replace function public.notify_post_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_title text;
  v_name text;
begin
  select owner_id, title into v_owner, v_title from public.posts where id = new.post_id;
  if v_owner is null or v_owner = new.author_id then
    return new;
  end if;

  select full_name into v_name from public.profiles where id = new.author_id;

  insert into public.notifications (
    recipient_id, actor_id, actor_name, type, title, body, link, read
  )
  values (
    v_owner,
    new.author_id,
    coalesce(v_name, 'Một sinh viên'),
    'post_comment',
    'Có bình luận mới trên tin của bạn',
    coalesce(v_name, 'Một sinh viên') || ' vừa bình luận về “' || coalesce(v_title, 'tin đăng') ||
      '”: ' || left(new.body, 140),
    '/marketplace/' || new.post_id::text,
    false
  );

  return new;
end;
$$;

drop trigger if exists on_post_comment_created on public.post_comments;
create trigger on_post_comment_created
  after insert on public.post_comments
  for each row execute function public.notify_post_comment();
