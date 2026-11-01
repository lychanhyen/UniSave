-- ============================================================================
-- UniSave – Supabase schema
-- Chạy toàn bộ file này trong Supabase Dashboard → SQL Editor.
-- Sau khi chạy, điền VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào .env.local.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Bảng dữ liệu
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  student_code text,
  campus text not null default 'khac',
  avatar_url text,
  student_card_url text not null default '',
  is_verified boolean not null default false,
  role text not null default 'student' check (role in ('student', 'admin')),
  verification_status text not null default 'none'
    check (verification_status in ('none', 'pending', 'approved', 'rejected')),
  verification_note text not null default '',
  is_locked boolean not null default false,
  verified_at timestamptz,
  verified_by uuid references public.profiles (id) on delete set null,
  locked_at timestamptz,
  locked_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Nâng cấp DB đã tạo trước đây (chạy lại file này vẫn an toàn).
alter table public.profiles add column if not exists role text not null default 'student';
alter table public.profiles add column if not exists verification_status text not null default 'none';
alter table public.profiles add column if not exists verification_note text not null default '';
alter table public.profiles add column if not exists is_locked boolean not null default false;
alter table public.profiles add column if not exists student_card_url text not null default '';
alter table public.profiles add column if not exists verified_at timestamptz;
alter table public.profiles add column if not exists verified_by uuid references public.profiles (id) on delete set null;
alter table public.profiles add column if not exists locked_at timestamptz;
alter table public.profiles add column if not exists locked_by uuid references public.profiles (id) on delete set null;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  type text not null default 'pass' check (type in ('pass', 'rent')),
  price numeric not null default 0 check (price >= 0),
  category text not null default 'other',
  images jsonb not null default '[]'::jsonb,
  contact text not null default '',
  location text not null default 'khac',
  status text not null default 'active' check (status in ('active', 'sold', 'deleted')),
  sold_at timestamptz,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Xoá mềm: tin đã xoá vẫn còn dòng để lưu lịch sử đăng tin.
-- status: active = chưa bán, sold = đã bán, deleted = đã xoá.
alter table public.posts add column if not exists deleted_at timestamptz;
alter table public.posts add column if not exists deleted_by uuid references public.profiles (id) on delete set null;

create table if not exists public.post_inquiries (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  buyer_name text,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  original_price numeric not null default 0 check (original_price >= 0),
  deal_price numeric not null default 0 check (deal_price >= 0),
  ship_saving numeric not null default 0 check (ship_saving >= 0),
  owner_bank text not null default '',
  min_members integer not null default 2 check (min_members >= 2),
  status text not null default 'open' check (status in ('open', 'full')),
  deadline timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.deal_participants (
  deal_id uuid not null references public.deals (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  paid boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (deal_id, user_id)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric not null check (amount > 0),
  note text not null default '',
  category text not null default 'other',
  is_unexpected boolean not null default false,
  unexpected_reason text,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.budgets (
  user_id uuid not null references public.profiles (id) on delete cascade,
  month text not null,
  total_amount numeric not null default 0 check (total_amount >= 0),
  total_days integer not null default 30 check (total_days between 1 and 31),
  updated_at timestamptz not null default now(),
  primary key (user_id, month)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  type text not null default 'system',
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reporter_name text not null default '',
  target_type text not null check (target_type in ('post', 'user')),
  target_id text not null,
  target_label text not null default '',
  reason text not null,
  details text not null default '',
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  admin_note text not null default '',
  action_taken text not null default '',
  resolved_by uuid references public.profiles (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

-- Khu vực (KTX, trường đại học, quận/huyện…) do quản trị viên cấu hình.
-- Giá trị 'value' được lưu trong profiles.campus và posts.location nên không đổi
-- sau khi tạo; chỉ nhãn/thứ tự/trạng thái là sửa được.
create table if not exists public.campuses (
  value text primary key,
  label text not null check (char_length(btrim(label)) between 2 and 60),
  area text not null default '',
  kind text not null default 'other' check (kind in ('ktx', 'university', 'area', 'other')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.campuses add column if not exists area text not null default '';
alter table public.campuses add column if not exists kind text not null default 'other';
alter table public.campuses add column if not exists sort_order integer not null default 0;
alter table public.campuses add column if not exists is_active boolean not null default true;
alter table public.campuses add column if not exists updated_at timestamptz not null default now();

insert into public.campuses (value, label, area, kind, sort_order)
values
  ('ktx-a', 'KTX Khu A', 'Làng đại học', 'ktx', 10),
  ('ktx-b', 'KTX Khu B', 'Làng đại học', 'ktx', 20),
  ('bach-khoa', 'ĐH Bách Khoa', 'Hai Bà Trưng', 'university', 30),
  ('kinh-te', 'ĐH Kinh tế Quốc dân', 'Hai Bà Trưng', 'university', 40),
  ('quoc-gia', 'ĐH Quốc gia', 'Thủ Đức', 'university', 50),
  ('fpt', 'ĐH FPT', 'Hòa Lạc', 'university', 60),
  ('khac', 'Khu vực khác', 'Toàn thành phố', 'other', 999)
on conflict (value) do nothing;

create index if not exists posts_owner_idx on public.posts (owner_id);
create index if not exists posts_status_idx on public.posts (status, created_at desc);
create index if not exists posts_location_idx on public.posts (location);
create index if not exists inquiries_post_idx on public.post_inquiries (post_id);
create index if not exists deals_owner_idx on public.deals (owner_id);
create index if not exists deals_status_idx on public.deals (status, created_at desc);
create index if not exists participants_user_idx on public.deal_participants (user_id);
create index if not exists expenses_user_date_idx on public.expenses (user_id, date desc);
create index if not exists notifications_recipient_idx on public.notifications (recipient_id, created_at desc);
create index if not exists reports_status_idx on public.reports (status, created_at desc);
create index if not exists reports_reporter_idx on public.reports (reporter_id);
create index if not exists reports_target_idx on public.reports (target_type, target_id);
create index if not exists profiles_role_idx on public.profiles (role, verification_status);

-- ---------------------------------------------------------------------------
-- 2. Tự tạo profile khi đăng ký
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, student_code, campus, verification_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'student_code',
    coalesce(new.raw_user_meta_data ->> 'campus', 'khac'),
    'pending'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2b. Helper phân quyền (dùng trong RLS/RPC)
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and is_locked = false
  );
$$;

create or replace function public.can_post()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and is_locked = false
      and (is_verified = true or role = 'admin')
  );
$$;

-- ---------------------------------------------------------------------------
-- 3. Trigger thông báo realtime
-- ---------------------------------------------------------------------------

-- Có người tham gia kèo / kèo đủ người
create or replace function public.notify_deal_join()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_title text;
  v_min integer;
  v_count integer;
  v_name text;
begin
  select owner_id, title, min_members
    into v_owner, v_title, v_min
  from public.deals
  where id = new.deal_id;

  select full_name into v_name from public.profiles where id = new.user_id;

  if v_owner is not null and v_owner <> new.user_id then
    insert into public.notifications (recipient_id, actor_id, type, title, body, link)
    values (
      v_owner,
      new.user_id,
      'deal_join',
      coalesce(v_name, 'Một sinh viên') || ' đã tham gia kèo của bạn',
      'Kèo “' || v_title || '” vừa có thêm người tham gia.',
      '/deals'
    );
  end if;

  select count(*) into v_count from public.deal_participants where deal_id = new.deal_id;

  if v_count >= v_min then
    update public.deals set status = 'full' where id = new.deal_id;

    if v_owner is not null then
      insert into public.notifications (recipient_id, actor_id, type, title, body, link)
      values (
        v_owner,
        new.user_id,
        'deal_full',
        'Kèo của bạn đã đủ người 🎉',
        '“' || v_title || '” đã đủ ' || v_min || ' người. Mở công cụ chia tiền ngay.',
        '/deals'
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_deal_participant_added on public.deal_participants;
create trigger on_deal_participant_added
  after insert on public.deal_participants
  for each row execute function public.notify_deal_join();

-- Rời kèo thì mở lại trạng thái nếu chưa đủ người
create or replace function public.sync_deal_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_min integer;
  v_count integer;
  v_deal_id uuid := old.deal_id;
begin
  select min_members into v_min from public.deals where id = v_deal_id;
  select count(*) into v_count from public.deal_participants where deal_id = v_deal_id;

  update public.deals
  set status = case when v_count >= v_min then 'full' else 'open' end
  where id = v_deal_id;

  return old;
end;
$$;

drop trigger if exists on_deal_participant_removed on public.deal_participants;
create trigger on_deal_participant_removed
  after delete on public.deal_participants
  for each row execute function public.sync_deal_status();

-- Có người hỏi mua trên chợ
create or replace function public.notify_post_inquiry()
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
  select full_name into v_name from public.profiles where id = new.buyer_id;

  if v_owner is not null and v_owner <> new.buyer_id then
    insert into public.notifications (recipient_id, actor_id, type, title, body, link)
    values (
      v_owner,
      new.buyer_id,
      'post_inquiry',
      coalesce(v_name, new.buyer_name, 'Một sinh viên') || ' hỏi mua ' || v_title,
      new.message,
      '/marketplace/' || new.post_id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_post_inquiry_created on public.post_inquiries;
create trigger on_post_inquiry_created
  after insert on public.post_inquiries
  for each row execute function public.notify_post_inquiry();

-- Hồ sơ mới đăng ký → thông báo cho toàn bộ admin
create or replace function public.notify_admins_new_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'admin' then
    return new;
  end if;

  insert into public.notifications (recipient_id, type, title, body, link)
  select
    p.id,
    'admin_verification',
    'Hồ sơ sinh viên mới cần duyệt',
    coalesce(new.full_name, 'Sinh viên')
      || ' (' || coalesce(nullif(new.student_code, ''), 'chưa có MSSV')
      || ') vừa đăng ký và đang chờ xác minh.',
    '/admin/students'
  from public.profiles p
  where p.role = 'admin' and p.is_locked = false;

  return new;
end;
$$;

drop trigger if exists on_profile_created_notify_admins on public.profiles;
create trigger on_profile_created_notify_admins
  after insert on public.profiles
  for each row execute function public.notify_admins_new_profile();

-- Tố cáo mới → thông báo cho admin
create or replace function public.notify_admins_new_report()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (recipient_id, type, title, body, link)
  select
    p.id,
    'admin_report',
    'Tố cáo mới: ' || new.reason,
    new.reporter_name || ' tố cáo '
      || case when new.target_type = 'post' then 'tin đăng' else 'người dùng' end
      || ' “' || coalesce(nullif(new.target_label, ''), new.target_id) || '”.',
    '/admin/reports'
  from public.profiles p
  where p.role = 'admin' and p.is_locked = false;

  return new;
end;
$$;

drop trigger if exists on_report_created_notify_admins on public.reports;
create trigger on_report_created_notify_admins
  after insert on public.reports
  for each row execute function public.notify_admins_new_report();

-- Admin xử lý tố cáo → thông báo cho người tố cáo
create or replace function public.notify_report_resolved()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'open' and new.status in ('resolved', 'dismissed') then
    insert into public.notifications (recipient_id, type, title, body, link)
    values (
      new.reporter_id,
      'report_resolved',
      'Tố cáo của bạn đã được xử lý',
      coalesce(nullif(new.admin_note, ''), 'Quản trị viên đã xem xét và xử lý tố cáo của bạn.'),
      '/marketplace'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_report_resolved_notify_reporter on public.reports;
create trigger on_report_resolved_notify_reporter
  after update on public.reports
  for each row execute function public.notify_report_resolved();

-- ---------------------------------------------------------------------------
-- 3b. RPC cho sinh viên và quản trị viên
-- ---------------------------------------------------------------------------

create or replace function public.request_verification()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
begin
  select * into v_profile from public.profiles where id = auth.uid();
  if v_profile.id is null then
    raise exception 'Không tìm thấy hồ sơ sinh viên.';
  end if;
  if v_profile.is_locked then
    raise exception 'Tài khoản đang bị khóa, không thể gửi yêu cầu.';
  end if;
  if v_profile.is_verified then
    return;
  end if;
  if coalesce(v_profile.student_card_url, '') = '' then
    raise exception 'Vui lòng tải ảnh thẻ sinh viên trước khi gửi yêu cầu xác minh.';
  end if;

  update public.profiles
  set verification_status = 'pending',
      verification_note = ''
  where id = auth.uid();

  insert into public.notifications (recipient_id, type, title, body, link)
  select
    p.id,
    'admin_verification',
    'Yêu cầu xác minh mới',
    v_profile.full_name || ' đã gửi lại yêu cầu xác minh sinh viên.',
    '/admin/students'
  from public.profiles p
  where p.role = 'admin' and p.is_locked = false;
end;
$$;

create or replace function public.admin_set_verification(
  target_user uuid,
  approve boolean,
  note text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target public.profiles%rowtype;
  v_status text := case when approve then 'approved' else 'rejected' end;
begin
  if not public.is_admin() then
    raise exception 'Chỉ quản trị viên được duyệt hồ sơ.';
  end if;

  select * into v_target from public.profiles where id = target_user;
  if v_target.id is null then
    raise exception 'Không tìm thấy sinh viên.';
  end if;
  if v_target.role = 'admin' then
    raise exception 'Không thể thay đổi xác minh của quản trị viên.';
  end if;

  update public.profiles
  set verification_status = v_status,
      is_verified = approve,
      verification_note = coalesce(note, ''),
      verified_at = case when approve then now() else null end,
      verified_by = case when approve then auth.uid() else null end
  where id = target_user;

  insert into public.notifications (recipient_id, type, title, body, link)
  values (
    target_user,
    case when approve then 'verification_approved' else 'verification_rejected' end,
    case when approve
      then 'Hồ sơ sinh viên đã được duyệt 🎉'
      else 'Yêu cầu xác minh chưa được duyệt'
    end,
    case when approve
      then 'Bạn đã nhận huy hiệu “Đã xác minh sinh viên” và có thể đăng tin, tạo kèo gom đơn.'
      else coalesce(nullif(note, ''), 'Hồ sơ chưa đủ điều kiện. Vui lòng kiểm tra lại thông tin và gửi lại yêu cầu.')
    end,
    '/profile'
  );
end;
$$;

create or replace function public.admin_set_locked(
  target_user uuid,
  locked boolean,
  note text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target public.profiles%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Chỉ quản trị viên được khóa tài khoản.';
  end if;

  select * into v_target from public.profiles where id = target_user;
  if v_target.id is null then
    raise exception 'Không tìm thấy tài khoản.';
  end if;
  if v_target.role = 'admin' then
    raise exception 'Không thể khóa tài khoản quản trị viên.';
  end if;

  update public.profiles
  set is_locked = locked,
      locked_at = case when locked then now() else null end,
      locked_by = case when locked then auth.uid() else null end,
      verification_note = case
        when locked then coalesce(nullif(note, ''), verification_note)
        else verification_note
      end
  where id = target_user;

  insert into public.notifications (recipient_id, type, title, body, link)
  values (
    target_user,
    case when locked then 'account_locked' else 'account_unlocked' end,
    case when locked then 'Tài khoản của bạn đã bị khóa' else 'Tài khoản của bạn đã được mở khóa' end,
    case when locked
      then coalesce(nullif(note, ''), 'Tài khoản bị khóa do vi phạm quy định cộng đồng. Liên hệ quản trị viên để được hỗ trợ.')
      else 'Bạn có thể tiếp tục sử dụng UniSave. Hãy tuân thủ quy định cộng đồng nhé.'
    end,
    case when locked then '/' else '/dashboard' end
  );
end;
$$;

revoke all on function public.request_verification() from public;
revoke all on function public.admin_set_verification(uuid, boolean, text) from public;
revoke all on function public.admin_set_locked(uuid, boolean, text) from public;
grant execute on function public.request_verification() to authenticated;
grant execute on function public.admin_set_verification(uuid, boolean, text) to authenticated;
grant execute on function public.admin_set_locked(uuid, boolean, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_inquiries enable row level security;
alter table public.deals enable row level security;
alter table public.deal_participants enable row level security;
alter table public.expenses enable row level security;
alter table public.budgets enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

-- profiles
drop policy if exists "profiles are readable" on public.profiles;
create policy "profiles are readable" on public.profiles
  for select using (true);

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile" on public.profiles
  for insert to authenticated with check (id = auth.uid() and role = 'student');

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Chỉ cho phép tự sửa các cột hồ sơ công khai. Các cột role / xác minh / khóa
-- chỉ được thay đổi qua RPC security definer ở trên.
revoke update on public.profiles from anon, authenticated;
grant update (full_name, student_code, campus, avatar_url, student_card_url) on public.profiles to authenticated;

-- posts
drop policy if exists "posts are readable" on public.posts;
create policy "posts are readable" on public.posts
  for select using (true);

drop policy if exists "owners insert posts" on public.posts;
create policy "owners insert posts" on public.posts
  for insert to authenticated with check (owner_id = auth.uid() and public.can_post());

drop policy if exists "owners update posts" on public.posts;
create policy "owners update posts" on public.posts
  for update to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "owners delete posts" on public.posts;
create policy "owners delete posts" on public.posts
  for delete to authenticated using (owner_id = auth.uid() or public.is_admin());

-- post inquiries
drop policy if exists "inquiries readable by buyer or seller" on public.post_inquiries;
create policy "inquiries readable by buyer or seller" on public.post_inquiries
  for select to authenticated using (
    buyer_id = auth.uid()
    or exists (
      select 1 from public.posts p
      where p.id = post_id and p.owner_id = auth.uid()
    )
  );

drop policy if exists "buyers create inquiries" on public.post_inquiries;
create policy "buyers create inquiries" on public.post_inquiries
  for insert to authenticated with check (buyer_id = auth.uid());

drop policy if exists "buyers delete own inquiries" on public.post_inquiries;
create policy "buyers delete own inquiries" on public.post_inquiries
  for delete to authenticated using (buyer_id = auth.uid());

-- deals
drop policy if exists "deals are readable" on public.deals;
create policy "deals are readable" on public.deals
  for select using (true);

drop policy if exists "owners insert deals" on public.deals;
create policy "owners insert deals" on public.deals
  for insert to authenticated with check (owner_id = auth.uid() and public.can_post());

drop policy if exists "owners update deals" on public.deals;
create policy "owners update deals" on public.deals
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "owners delete deals" on public.deals;
create policy "owners delete deals" on public.deals
  for delete to authenticated using (owner_id = auth.uid());

-- deal participants
drop policy if exists "participants are readable" on public.deal_participants;
create policy "participants are readable" on public.deal_participants
  for select using (true);

drop policy if exists "users join deals" on public.deal_participants;
create policy "users join deals" on public.deal_participants
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "users update payment or owner updates" on public.deal_participants;
create policy "users update payment or owner updates" on public.deal_participants
  for update to authenticated using (
    user_id = auth.uid()
    or exists (
      select 1 from public.deals d
      where d.id = deal_id and d.owner_id = auth.uid()
    )
  );

drop policy if exists "users leave or owner removes" on public.deal_participants;
create policy "users leave or owner removes" on public.deal_participants
  for delete to authenticated using (
    user_id = auth.uid()
    or exists (
      select 1 from public.deals d
      where d.id = deal_id and d.owner_id = auth.uid()
    )
  );

-- expenses
drop policy if exists "users read own expenses" on public.expenses;
create policy "users read own expenses" on public.expenses
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "users insert own expenses" on public.expenses;
create policy "users insert own expenses" on public.expenses
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "users update own expenses" on public.expenses;
create policy "users update own expenses" on public.expenses
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "users delete own expenses" on public.expenses;
create policy "users delete own expenses" on public.expenses
  for delete to authenticated using (user_id = auth.uid());

-- budgets
drop policy if exists "users read own budgets" on public.budgets;
create policy "users read own budgets" on public.budgets
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "users upsert own budgets" on public.budgets;
create policy "users upsert own budgets" on public.budgets
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "users update own budgets" on public.budgets;
create policy "users update own budgets" on public.budgets
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- notifications
drop policy if exists "users read own notifications" on public.notifications;
create policy "users read own notifications" on public.notifications
  for select to authenticated using (recipient_id = auth.uid());

drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications" on public.notifications
  for update to authenticated using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

drop policy if exists "users delete own notifications" on public.notifications;
create policy "users delete own notifications" on public.notifications
  for delete to authenticated using (recipient_id = auth.uid());

-- Admin gửi thông báo hệ thống (gỡ bài, khóa tài khoản...)
drop policy if exists "admins insert notifications" on public.notifications;
create policy "admins insert notifications" on public.notifications
  for insert to authenticated with check (public.is_admin());

-- reports
drop policy if exists "reports readable by reporter or admin" on public.reports;
create policy "reports readable by reporter or admin" on public.reports
  for select to authenticated using (reporter_id = auth.uid() or public.is_admin());

drop policy if exists "users create own reports" on public.reports;
create policy "users create own reports" on public.reports
  for insert to authenticated with check (reporter_id = auth.uid());

drop policy if exists "admins update reports" on public.reports;
create policy "admins update reports" on public.reports
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete reports" on public.reports;
create policy "admins delete reports" on public.reports
  for delete to authenticated using (public.is_admin());

-- campuses
alter table public.campuses enable row level security;

drop policy if exists "campuses are readable" on public.campuses;
create policy "campuses are readable" on public.campuses
  for select using (true);

drop policy if exists "admins manage campuses" on public.campuses;
create policy "admins manage campuses" on public.campuses
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.campuses to anon, authenticated;
grant insert, update, delete on public.campuses to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Realtime
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'posts'
  ) then
    alter publication supabase_realtime add table public.posts;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'deals'
  ) then
    alter publication supabase_realtime add table public.deals;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'deal_participants'
  ) then
    alter publication supabase_realtime add table public.deal_participants;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reports'
  ) then
    alter publication supabase_realtime add table public.reports;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. Storage cho ảnh tin đăng
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "post images are readable" on storage.objects;
create policy "post images are readable" on storage.objects
  for select using (bucket_id = 'post-images');

drop policy if exists "users upload post images" on storage.objects;
create policy "users upload post images" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users delete own post images" on storage.objects;
create policy "users delete own post images" on storage.objects
  for delete to authenticated using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- 7. Storage cho ảnh thẻ sinh viên (bucket riêng tư)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('student-cards', 'student-cards', false)
on conflict (id) do nothing;

-- Chủ hồ sơ và quản trị viên được xem ảnh thẻ.
drop policy if exists "student cards readable by owner or admin" on storage.objects;
create policy "student cards readable by owner or admin" on storage.objects
  for select to authenticated using (
    bucket_id = 'student-cards'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

drop policy if exists "users upload own student card" on storage.objects;
create policy "users upload own student card" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'student-cards'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users update own student card" on storage.objects;
create policy "users update own student card" on storage.objects
  for update to authenticated using (
    bucket_id = 'student-cards'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users delete own student card" on storage.objects;
create policy "users delete own student card" on storage.objects
  for delete to authenticated using (
    bucket_id = 'student-cards'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- 8. Storage cho ảnh đại diện (bucket công khai)
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
