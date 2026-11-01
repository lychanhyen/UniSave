-- ---------------------------------------------------------------------------
-- Bill chuyển khoản cho kèo gom đơn
--
-- Chạy một lần trên project đã có schema:
--   node scripts/db.mjs run supabase/deal-bill.sql
--
-- Người tham gia tải ảnh bill; chủ kèo và quản trị viên xem được để đối chiếu,
-- tránh tranh chấp "đã chuyển nhưng chủ kèo bảo chưa nhận".
-- Bucket để riêng tư vì bill có số tài khoản, số tiền, thời gian giao dịch.
-- ---------------------------------------------------------------------------

alter table public.deal_participants add column if not exists bill_url text not null default '';
alter table public.deal_participants add column if not exists bill_uploaded_at timestamptz;

comment on column public.deal_participants.bill_url is
  'Đường dẫn ảnh bill chuyển khoản trong bucket riêng tư deal-bills';

-- 1. Bucket riêng tư
insert into storage.buckets (id, name, public)
values ('deal-bills', 'deal-bills', false)
on conflict (id) do nothing;

-- 2. Xem: chính người tải, chủ kèo tương ứng, hoặc quản trị viên
drop policy if exists "deal bills readable" on storage.objects;
create policy "deal bills readable" on storage.objects
  for select to authenticated using (
    bucket_id = 'deal-bills'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
      or exists (
        select 1
        from public.deal_participants dp
        join public.deals d on d.id = dp.deal_id
        where d.owner_id = auth.uid()
          and dp.user_id::text = (storage.foldername(name))[1]
      )
    )
  );

-- 3. Tải lên / xoá: chỉ trong thư mục của mình
drop policy if exists "users upload own deal bill" on storage.objects;
create policy "users upload own deal bill" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'deal-bills'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users delete own deal bill" on storage.objects;
create policy "users delete own deal bill" on storage.objects
  for delete to authenticated using (
    bucket_id = 'deal-bills'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Gắn bill vào lượt tham gia kèo (chỉ chính mình, gửi thông báo cho chủ kèo)
create or replace function public.deal_attach_bill(p_deal uuid, p_path text)
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
  if coalesce(p_path, '') = '' then
    raise exception 'Thiếu đường dẫn bill.';
  end if;

  select owner_id into v_owner from public.deals where id = p_deal;
  if v_owner is null then
    raise exception 'Không tìm thấy kèo.';
  end if;

  update public.deal_participants
     set bill_url = p_path,
         bill_uploaded_at = now()
   where deal_id = p_deal
     and user_id = auth.uid();

  if not found then
    raise exception 'Bạn chưa tham gia kèo này.';
  end if;

  select full_name into v_name from public.profiles where id = auth.uid();

  if v_owner <> auth.uid() then
    insert into public.notifications (recipient_id, actor_id, actor_name, type, title, body, link)
    values (
      v_owner,
      auth.uid(),
      coalesce(v_name, 'Một thành viên'),
      'deal_bill_uploaded',
      'Có bill chuyển khoản mới',
      coalesce(v_name, 'Một thành viên') || ' vừa tải bill chuyển khoản cho kèo của bạn. Mở kèo để đối chiếu.',
      '/deals'
    );
  end if;
end;
$$;

revoke all on function public.deal_attach_bill(uuid, text) from public;
grant execute on function public.deal_attach_bill(uuid, text) to authenticated;
