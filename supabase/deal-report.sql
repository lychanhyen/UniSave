-- ---------------------------------------------------------------------------
-- Tố cáo kèo gom đơn + người bị tố cáo nhận thông báo
--
-- Chạy một lần trên project đã có schema:
--   node scripts/db.mjs run supabase/deal-report.sql
--
-- Trước đây chỉ tố cáo được tin đăng (post) hoặc người dùng (user). Nay thêm
-- 'deal' để tố cáo kèo có dấu hiệu lừa đảo; chủ kèo nhận thông báo kèm link
-- /deals, quản trị viên xem tố cáo rồi mở kèo đối chiếu bill chuyển khoản.
-- ---------------------------------------------------------------------------

alter table public.reports drop constraint if exists reports_target_type_check;
alter table public.reports
  add constraint reports_target_type_check check (target_type in ('post', 'user', 'deal'));

create or replace function public.notify_report_target()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target uuid;
  v_kind text;
  v_link text;
begin
  if new.target_type = 'user' then
    v_target := new.target_id::uuid;
    v_kind := 'tài khoản';
    v_link := '/profile';
  elsif new.target_type = 'deal' then
    select owner_id into v_target from public.deals where id = new.target_id::uuid;
    v_kind := 'kèo gom đơn';
    v_link := '/deals';
  else
    select owner_id into v_target from public.posts where id = new.target_id::uuid;
    v_kind := 'tin đăng';
    v_link := '/marketplace/' || new.target_id;
  end if;

  if v_target is null or v_target = new.reporter_id then
    return new;
  end if;

  insert into public.notifications (
    recipient_id, actor_id, actor_name, type, title, body, link, read
  )
  values (
    v_target,
    null,
    'UniSave',
    'report_received',
    'Bạn đã nhận 1 lượt tố cáo',
    'Có người vừa tố cáo ' || v_kind || ' của bạn với lý do “' || new.reason ||
      '”. Nếu bạn cho rằng tố cáo này sai sự thật, hãy gửi kháng cáo tới quản trị viên UniSave để được xem xét lại.',
    v_link,
    false
  );

  return new;
end;
$$;
