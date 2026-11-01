-- ============================================================================
-- UniSave – kiểm tra nhanh sau khi chạy schema.sql
-- Dán vào SQL Editor và Run. Mọi dòng "exists = true", "rls = true" là đạt.
-- ============================================================================

-- 1. Bảng đã tạo chưa + RLS đã bật chưa
with expected(table_name) as (
  values
    ('profiles'),
    ('posts'),
    ('post_inquiries'),
    ('deals'),
    ('deal_participants'),
    ('expenses'),
    ('budgets'),
    ('notifications'),
    ('reports'),
    ('campuses')
)
select
  e.table_name,
  to_regclass('public.' || e.table_name) is not null as exists,
  coalesce(
    (select c.relrowsecurity from pg_class c where c.oid = to_regclass('public.' || e.table_name)),
    false
  ) as rls_enabled
from expected e;

-- 2. Cột quan trọng của profiles (phải có đủ 6 cột mới)
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'profiles'
order by ordinal_position;

-- 3. Khoá chính / khoá ngoại
select
  tc.table_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name as references_table,
  ccu.column_name as references_column
from information_schema.table_constraints tc
left join information_schema.key_column_usage kcu
  on kcu.constraint_name = tc.constraint_name and kcu.table_schema = tc.table_schema
left join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name and ccu.table_schema = tc.table_schema
where tc.table_schema = 'public'
  and tc.constraint_type in ('PRIMARY KEY', 'FOREIGN KEY')
order by tc.table_name, tc.constraint_type, kcu.ordinal_position;

-- 4. Hàm RPC phải tồn tại
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'handle_new_user', 'is_admin', 'can_post',
    'request_verification', 'admin_set_verification', 'admin_set_locked'
  )
order by routine_name;

-- 4b. Khu vực do admin cấu hình (phải có sẵn 7 giá trị seed)
select value, label, kind, sort_order, is_active
from public.campuses
order by sort_order;

-- 5. Bucket ảnh (post-images công khai, student-cards riêng tư)
select id, name, public
from storage.buckets
where id in ('post-images', 'student-cards')
order by id;

-- 6. Trigger thông báo
select trigger_name, event_object_schema, event_object_table
from information_schema.triggers
where trigger_schema in ('public', 'auth')
order by event_object_table, trigger_name;
