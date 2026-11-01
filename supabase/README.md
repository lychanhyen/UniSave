# UniSave – Supabase setup

Ứng dụng chạy đầy đủ ở **chế độ demo** (localStorage) khi chưa cấu hình Supabase.
Để đồng bộ dữ liệu thật giữa nhiều tài khoản và bật thông báo realtime, làm theo các bước sau.

> **Chế độ demo vẫn yêu cầu đăng nhập.** Tài khoản mẫu (mật khẩu `123456`):
>
> - `sinhvien@unisave.vn` – sinh viên đã xác minh
> - `cho@unisave.vn` – sinh viên chờ duyệt (bị chặn đăng bài)
> - `admin@unisave.vn` – quản trị viên
>
> Trang chủ `/` công khai; mọi trang dashboard/chợ/kèo/admin đều yêu cầu đăng nhập.
>
> Ở chế độ demo có thể tự tạo tài khoản quản trị tại `/register` → chọn **Quản trị viên**
> và nhập mã mời `UNISAVE-ADMIN` (không cần MSSV). Tài khoản, ảnh thẻ và thông báo demo
> chỉ lưu trong **cùng một trình duyệt** (`localStorage`), nên phải đăng ký rồi đăng nhập
> admin trên cùng trình duyệt mới thấy hồ sơ mới. Muốn đồng bộ nhiều máy, cấu hình Supabase.

## 0. Bắt đầu nhanh (3 bước)

1. **Tạo bảng:** Supabase Dashboard → **SQL Editor** → New query → dán **toàn bộ**
   [`supabase/schema.sql`](./schema.sql) → **Run**. File này idempotent (chạy lại vẫn an toàn)
   và tạo đủ: 10 bảng + khoá chính/ngoại, index, RLS, hàm RPC, trigger thông báo, realtime
   và 2 bucket ảnh.
2. **Lấy khoá:** **Project Settings → API** → copy `Project URL` và `anon public key`.
3. **Nối vào project:** tạo `.env.local` ở thư mục gốc (xem mục 3), chạy lại `npm run dev`.

Kiểm tra sau khi chạy: dán [`supabase/verify.sql`](./verify.sql) vào SQL Editor và Run —
tất cả bảng phải `exists = true`, `rls_enabled = true`, đủ 2 bucket và 6 hàm.

## 1. Tạo project

1. Vào <https://supabase.com/dashboard> → **New project**.
2. Chọn region gần Việt Nam (Singapore) để giảm độ trễ.
3. Đợi project khởi tạo xong.

## 2. Chạy schema

1. Mở **SQL Editor** → **New query**.
2. Dán toàn bộ nội dung file [`supabase/schema.sql`](./schema.sql) và bấm **Run**.
3. File này tạo bảng, index, RLS, trigger thông báo, realtime publication và bucket ảnh.

## 3. Cấu hình biến môi trường

Mở **Project Settings → API**, copy `Project URL` và `anon public key`, sau đó tạo file
`.env.local` ở thư mục gốc:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> Không commit `.env.local`. Nếu để trống hoặc dùng giá trị mẫu, app tự chuyển về chế độ demo.

## 4. Bật đăng ký / đăng nhập

- **Authentication → Providers → Email**: bật Email provider.
- Nếu muốn đăng ký dùng ngay không cần xác nhận email:
  **Authentication → Settings → Email Auth** → tắt **Confirm email** (chỉ nên dùng khi phát triển).
- Trigger `handle_new_user` tự tạo profile với `full_name`, `student_code`, `campus` từ metadata.
  Mọi hồ sơ mới đều có `verification_status = 'pending'` và chờ admin duyệt.

### 4.1. Tạo quản trị viên đầu tiên

Đăng ký một tài khoản bình thường bằng email admin (ví dụ `admin@unisave.vn`), sau đó chạy
trong **SQL Editor**:

```sql
update public.profiles
set role = 'admin',
    is_verified = true,
    verification_status = 'approved',
    verification_note = 'Tài khoản quản trị hệ thống.'
where id = (select id from auth.users where email = 'admin@unisave.vn');
```

Đăng nhập lại bằng tài khoản đó để vào `/admin`. Không cấp quyền admin bằng cách sửa
`user_metadata`; cột `profiles.role` mới là nguồn quyền duy nhất.

### 4.2. Duyệt sinh viên

1. Sinh viên đăng ký → hồ sơ `pending`, admin nhận thông báo `admin_verification`.
2. Admin vào **Quản trị → Sinh viên**, đối chiếu họ tên, MSSV và thẻ sinh viên.
3. Bấm **Duyệt hồ sơ** → RPC `admin_set_verification` gán `is_verified = true`,
   `verification_status = 'approved'` và gửi thông báo cho sinh viên.
4. Sinh viên chưa duyệt vẫn xem được chợ/kèo nhưng bị chặn đăng bài, tạo kèo bởi
   policy `public.can_post()`.

### 4.3. Ảnh thẻ sinh viên

- Sinh viên tải ảnh thẻ ngay khi đăng ký hoặc bổ sung trong **Hồ sơ → Ảnh thẻ sinh viên**.
  Ảnh được nén ở client (~1200px, JPEG) trước khi tải lên.
- Ở chế độ Supabase, ảnh nằm trong bucket **riêng tư** `student-cards`, đường dẫn lưu ở
  `profiles.student_card_url`. Chỉ chủ hồ sơ và admin đọc được; giao diện đổi sang signed
  URL khi hiển thị.
- RPC `request_verification` từ chối nếu hồ sơ chưa có ảnh thẻ. Admin vẫn có thể duyệt hồ sơ
  thiếu ảnh nhưng trang quản trị hiển thị cảnh báo và tab **Thiếu ảnh thẻ** để nhắc bổ sung.

### 4.4. Cấu hình khu vực (KTX, trường, quận)

Mỗi trường có KTX và cơ sở khác nhau nên danh sách khu vực **không hard-code** trong code mà
do quản trị viên cấu hình trong bảng `campuses`.

- Vào **Quản trị → Khu vực**: thêm/sửa/xoá, đổi thứ tự hiển thị, tạm ẩn hoặc bật lại.
- Mỗi khu vực có `label` (tên sinh viên thấy), `area` (vị trí/ghi chú), `kind`
  (`ktx` | `university` | `area` | `other`) và `sort_order`.
- `value` là mã cố định được lưu trong `profiles.campus` và `posts.location`; mã này
  không đổi khi sửa tên nên tin đăng cũ không bị lệch.
- Khu vực `khac` (Khu vực khác) là giá trị dự phòng, không xoá được. Khi xoá một khu vực,
  dữ liệu cũ vẫn giữ mã và hiển thị thành “Khu vực khác”.
- RLS: mọi người đọc được danh sách (kể cả khách), chỉ admin được ghi.
- Danh sách này được dùng ở form đăng ký, form đăng tin, bộ lọc chợ và các bảng quản trị.

### 4.5. Tố cáo và khóa tài khoản

- Sinh viên gửi tố cáo tin đăng hoặc người dùng → bảng `reports`, admin nhận thông báo.
- Admin xử lý tại **Quản trị → Tố cáo**: chỉ nhắc nhở, gỡ bài, khóa tài khoản hoặc cả hai.
- Khóa/mở khóa dùng RPC `admin_set_locked`; tài khoản bị khóa bị đăng xuất ngay khi
  realtime profile cập nhật và không thể đăng nhập lại.
- Chỉ admin được insert thông báo hệ thống, update `reports`, hoặc update các cột
  `role`, `is_verified`, `is_locked` của người khác (qua RPC security definer).

## 5. Realtime

Schema đã thêm các bảng vào publication `supabase_realtime`:

- `notifications` – chuông thông báo nhận ngay khi có người tham gia kèo, hỏi mua,
  đăng ký chờ duyệt, được duyệt/từ chối, bị khóa/mở khóa hoặc tố cáo được xử lý.
- `posts`, `deals`, `deal_participants` – danh sách tự cập nhật khi có thay đổi.
- `reports` – trang quản trị tố cáo tự cập nhật khi có tố cáo mới.
- `profiles` – trạng thái xác minh/khóa của người dùng đồng bộ tức thì.

Kiểm tra tại **Database → Replication** nếu cần.

## 6. Ảnh tin đăng

Bucket `post-images` được tạo ở chế độ public read. Ảnh được upload theo thư mục
`{user_id}/...` và policy chỉ cho chính chủ upload/xóa.

## 7. Chạy app

```bash
npm install
npm run dev
```

Mở <http://localhost:5173>. Trang chủ công khai; muốn vào Dashboard/Chợ/Gom đơn phải đăng
nhập. Khi chưa cấu hình Supabase, app chạy demo với tài khoản mẫu ở trên.

## Ghi chú kiến trúc

- `src/lib/api.js` là lớp dữ liệu duy nhất: tự chọn Supabase hoặc localStorage.
- `src/lib/demoAuth.js` mô phỏng 3 tầng quyền, duyệt sinh viên, khóa tài khoản và tố cáo
  bằng localStorage khi chưa có Supabase.
- `src/hooks/useMarketplace.js`, `useDeals.js`, `useBudgetStore.js`, `useNotifications.js`,
  `useAdminUsers.js`, `useReports.js` giữ state lạc quan (optimistic) và đồng bộ realtime
  khi ở chế độ Supabase.
- `src/lib/image.js` nén ảnh ở client; `src/components/verification/StudentCardUpload.jsx`
  và `StudentCardImage.jsx` xử lý tải/preview ảnh thẻ cho cả demo (data URL) và Supabase
  (bucket riêng tư + signed URL).
- Thông báo `deal_join`, `deal_full`, `post_inquiry`, `admin_verification`, `admin_report`,
  `verification_approved`, `verification_rejected`, `account_locked`, `account_unlocked`,
  `report_resolved` được tạo bởi trigger SQL hoặc RPC, không phải client, nên không thể
  giả mạo người gửi.
