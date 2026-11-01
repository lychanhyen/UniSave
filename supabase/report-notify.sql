-- ---------------------------------------------------------------------------
-- Thông báo cho người bị tố cáo
--
-- Chạy một lần trên project đã có schema:
--   node scripts/db.mjs run supabase/report-notify.sql
--
-- RLS chỉ cho quản trị viên ghi bảng notifications, nên người tố cáo không tự
-- tạo thông báo cho người bị tố cáo được. Trigger security definer dưới đây
-- làm việc đó ở tầng database, kèm gợi ý kháng cáo nếu tố cáo sai sự thật.
-- ---------------------------------------------------------------------------

create or replace function public.notify_report_target()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target uuid;
  v_kind text := case when new.target_type = 'post' then 'tin đăng' else 'tài khoản' end;
  v_link text;
begin
  if new.target_type = 'user' then
    v_target := new.target_id;
    v_link := '/profile';
  else
    select owner_id into v_target from public.posts where id = new.target_id;
    v_link := '/marketplace/' || new.target_id::text;
  end if;

  -- Không gửi khi không xác định được người bị tố cáo hoặc tự tố cáo mình.
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

drop trigger if exists on_report_created_notify_target on public.reports;
create trigger on_report_created_notify_target
  after insert on public.reports
  for each row execute function public.notify_report_target();
