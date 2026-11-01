-- ---------------------------------------------------------------------------
-- Thanh toán kèo gom đơn: 2 bước (người chuyển báo → chủ kèo xác nhận)
--
-- Chạy một lần trên project đã có schema:
--   node scripts/db.mjs run supabase/deal-payment.sql
--
-- Trước đây cột paid do chính người tham gia tự bật, chủ kèo chưa nhận tiền
-- vẫn bị tính là "đã thu đủ". Nay tách thành 4 trạng thái:
--   unpaid    = chưa chuyển
--   declared  = người tham gia báo đã chuyển, chờ chủ kèo đối chiếu
--   confirmed = chủ kèo đã nhận tiền (paid = true)
--   disputed  = chủ kèo báo chưa nhận được
-- ---------------------------------------------------------------------------

alter table public.deal_participants
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'declared', 'confirmed', 'disputed'));

alter table public.deal_participants add column if not exists declared_at timestamptz;
alter table public.deal_participants add column if not exists confirmed_at timestamptz;
alter table public.deal_participants
  add column if not exists confirmed_by uuid references public.profiles (id) on delete set null;

-- Dữ liệu cũ: paid = true nghĩa là đã chốt, coi như chủ kèo đã xác nhận.
update public.deal_participants
set payment_status = 'confirmed',
    confirmed_at = coalesce(confirmed_at, now())
where paid = true
  and payment_status = 'unpaid';

-- 1. Người tham gia báo đã chuyển tiền (chỉ cho chính mình)
create or replace function public.deal_declare_payment(p_deal uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_name text;
begin
  if auth.uid() is null then
    raise exception 'Bạn cần đăng nhập.';
  end if;

  select owner_id into v_owner from public.deals where id = p_deal;
  if v_owner is null then
    raise exception 'Không tìm thấy kèo.';
  end if;
  if v_owner = auth.uid() then
    raise exception 'Chủ kèo tự trả phần của mình, không cần báo chuyển.';
  end if;

  update public.deal_participants
     set payment_status = 'declared',
         declared_at = now(),
         paid = false,
         confirmed_at = null,
         confirmed_by = null
   where deal_id = p_deal
     and user_id = auth.uid();

  if not found then
    raise exception 'Bạn chưa tham gia kèo này.';
  end if;

  select full_name into v_name from public.profiles where id = auth.uid();

  insert into public.notifications (recipient_id, actor_id, actor_name, type, title, body, link)
  values (
    v_owner,
    auth.uid(),
    coalesce(v_name, 'Một thành viên'),
    'deal_payment_declared',
    'Có người báo đã chuyển tiền',
    coalesce(v_name, 'Một thành viên') ||
      ' báo đã chuyển khoản cho kèo của bạn. Hãy kiểm tra tài khoản rồi bấm "Xác nhận đã nhận".',
    '/deals'
  );
end;
$$;

-- 2. Chủ kèo đối chiếu: xác nhận đã nhận hoặc báo chưa nhận
create or replace function public.deal_review_payment(p_deal uuid, p_user uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_title text;
begin
  if auth.uid() is null then
    raise exception 'Bạn cần đăng nhập.';
  end if;

  select owner_id, title into v_owner, v_title from public.deals where id = p_deal;
  if v_owner is null then
    raise exception 'Không tìm thấy kèo.';
  end if;
  if v_owner <> auth.uid() then
    raise exception 'Chỉ chủ kèo được xác nhận thanh toán.';
  end if;
  if p_user = v_owner then
    raise exception 'Không áp dụng cho chủ kèo.';
  end if;

  update public.deal_participants
     set payment_status = case when p_accept then 'confirmed' else 'disputed' end,
         paid = p_accept,
         confirmed_at = case when p_accept then now() else null end,
         confirmed_by = auth.uid()
   where deal_id = p_deal
     and user_id = p_user;

  if not found then
    raise exception 'Không tìm thấy thành viên trong kèo.';
  end if;

  insert into public.notifications (recipient_id, actor_id, actor_name, type, title, body, link)
  values (
    p_user,
    auth.uid(),
    'Chủ kèo',
    case when p_accept then 'deal_payment_confirmed' else 'deal_payment_disputed' end,
    case when p_accept
      then 'Chủ kèo đã xác nhận nhận tiền'
      else 'Chủ kèo báo chưa nhận được tiền'
    end,
    case when p_accept
      then 'Khoản chuyển của bạn cho kèo “' || v_title || '” đã được chủ kèo xác nhận.'
      else 'Chủ kèo chưa thấy khoản chuyển cho kèo “' || v_title || '”. Vui lòng kiểm tra lại và gửi ảnh chuyển khoản cho chủ kèo.'
    end,
    '/deals'
  );
end;
$$;

revoke all on function public.deal_declare_payment(uuid) from public;
revoke all on function public.deal_review_payment(uuid, uuid, boolean) from public;
grant execute on function public.deal_declare_payment(uuid) to authenticated;
grant execute on function public.deal_review_payment(uuid, uuid, boolean) to authenticated;
