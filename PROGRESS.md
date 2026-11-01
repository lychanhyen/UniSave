# UniSave — Trạng thái dự án

> Cập nhật lần cuối: 31/10/2026
> Trạng thái: **Hoàn thiện, chạy được ở chế độ demo; sẵn sàng nối Supabase thật.**
> Thư mục dự án: `D:\Giaiphap`

---

## 1. Chạy nhanh

```powershell
cd D:\Giaiphap
npm install
npm run dev
```

Mở <http://localhost:5173>.

- **Chưa cấu hình Supabase** → app chạy demo đầy đủ với dữ liệu mẫu trong `localStorage`
  (tiền tố `unisave:`). Demo **vẫn yêu cầu đăng nhập** bằng tài khoản mẫu:
  - `sinhvien@unisave.vn` — sinh viên đã xác minh, mật khẩu `123456`
  - `cho@unisave.vn` — sinh viên chờ duyệt, mật khẩu `123456`
  - `admin@unisave.vn` — quản trị viên, mật khẩu `123456`
  - Tự tạo tài khoản quản trị tại `/register` → **Quản trị viên** + mã mời `UNISAVE-ADMIN`
    (không cần MSSV, không cần ảnh thẻ).
  - Tài khoản, ảnh thẻ và thông báo demo chỉ lưu trong **cùng một trình duyệt**; đăng ký rồi
    đăng nhập admin trên cùng trình duyệt mới thấy hồ sơ mới. Cần đồng bộ nhiều máy → Supabase.
- **Đã cấu hình Supabase** → bắt buộc đăng nhập, dữ liệu đồng bộ giữa các tài khoản,
  thông báo realtime hoạt động.
- Trang chủ công khai tại `/`; đăng xuất nằm ở sidebar desktop, menu mobile và trang Hồ sơ,
  luôn đưa về trang chủ.

Build kiểm tra:

```powershell
npm run build
```

## 2. Công nghệ

| Thành phần | Phiên bản / ghi chú |
|---|---|
| React | 19.3.1 |
| Vite | 8.3.5 |
| TailwindCSS | 4.x + `@tailwindcss/vite` (theme bằng CSS) |
| Supabase JS | 2.118.0 |
| React Router | 7.x |
| Lucide React | icon bộ giao diện |
| Toast | react-hot-toast |
| Ngôn ngữ | JavaScript + JSX |

## 3. Tính năng đã hoàn thiện

### Trang chủ & điều hướng
- Trang chủ công khai tại `/` (hero, mô phỏng dashboard, tính năng, 3 bước, CTA, footer).
  - Khách chỉ thấy **Đăng nhập** + **Đăng ký**; không có nút vào thẳng dashboard.
  - Đã đăng nhập → nút “Vào Dashboard” hoặc “Vào trang quản trị” theo role.
- **Ba tầng quyền** được bảo vệ bằng route guard:
  - `guest` — chỉ `/`, `/login`, `/register`.
  - `student` — dashboard, chợ, gom đơn, hồ sơ; đăng bài/tạo kèo cần xác minh.
  - `admin` — `/admin`, `/admin/students`, `/admin/posts`, `/admin/reports`, `/admin/campuses`.
- Đăng xuất hiển thị ở sidebar desktop, menu mobile và trang Hồ sơ; luôn về `/`.

### Xác minh sinh viên & quản trị
- Đăng ký mới → hồ sơ `pending`, gửi thông báo cho admin. Đăng ký chọn được vai trò
  **Sinh viên** hoặc **Quản trị viên**; quản trị viên demo cần mã mời `UNISAVE-ADMIN`
  và không phải nhập MSSV/trường/khu vực/ảnh thẻ.
- **Ảnh thẻ sinh viên:** tải ngay khi đăng ký hoặc bổ sung trong Hồ sơ; ảnh nén ở client,
  lưu data URL ở demo và bucket riêng tư `student-cards` khi dùng Supabase. Bắt buộc có ảnh
  mới gửi được yêu cầu xác minh.
- Admin xem thumbnail/ảnh lớn, lọc tab **Thiếu ảnh thẻ**, duyệt/từ chối kèm ghi chú;
  duyệt xong gán badge **Đã xác minh sinh viên**.
- Sinh viên chưa duyệt vẫn xem chợ/kèo và tham gia kèo, nhưng bị chặn đăng bài/tạo kèo;
  hiển thị banner trạng thái và trang `VerificationPendingPage`.
- Admin quản lý bài đăng: tìm/lọc, xem tin, gỡ bài, khóa người đăng.
- Tố cáo tin đăng hoặc người dùng từ trang chi tiết tin; admin xử lý tại `/admin/reports`
  với các lựa chọn nhắc nhở, gỡ bài, khóa tài khoản hoặc cả hai.
- Khóa tài khoản → đăng xuất tức thì và chặn đăng nhập; mở khóa → dùng lại bình thường.

### Khu vực do admin cấu hình
- Danh sách khu vực (KTX, trường đại học, quận/khu vực) không còn hard-code: bảng `campuses`
  khi dùng Supabase, localStorage ở chế độ demo, đọc chung qua `CampusContext`.
- Admin vào **Quản trị → Khu vực**: thêm/sửa nhãn & vị trí, đổi nhóm (KTX/trường/khu vực),
  sắp xếp thứ tự, tạm ẩn hoặc bật lại; xoá kèm hộp thoại cảnh báo số tin đăng/hồ sơ đang dùng.
- Mã `value` sinh tự động từ tên (bỏ dấu tiếng Việt) và giữ nguyên khi đổi tên, nên tin đăng
  cũ không bị lệch; khu vực `khac` là giá trị dự phòng nên không xoá/tắt được.
- Form đăng ký, đăng tin, bộ lọc chợ, hồ sơ và các bảng quản trị đều lấy từ danh sách này;
  khu vực bị tạm ẩn không còn trong lựa chọn nhưng dữ liệu cũ vẫn hiển thị đúng.

### Dashboard & ngân sách
- Ngân sách tháng `M`, `D` ngày, heo đất mặc định `S0 = 10% M`.
- Hạn mức ngày tự tính lại theo quỹ còn lại ÷ số ngày còn lại.
- Ngày chi ít hơn hạn mức → phần dư chảy vào heo đất khi sang ngày mới.
- Ngày chi vượt → phần vượt trừ vào quỹ các ngày sau, hiển thị cảnh báo đỏ.
- **Khoản đột xuất** (sửa xe, y tế, thiết bị học tập…) được trừ vào quỹ chung ngay từ đầu
  và trải đều cả tháng, không đè nặng hạn mức ăn uống/sinh hoạt của đúng ngày phát sinh.
- Thẻ quỹ hôm nay đổi màu: xanh khi còn >30%, vàng khi ≤30%, đỏ khi vượt hạn mức.
- Widget dự báo heo đất cuối tháng + phần thưởng dự kiến nếu giữ đúng hạn mức.
- Biểu đồ 7 ngày có xếp chồng phần chi đột xuất.
- Thêm/xóa chi tiêu, đổi ngân sách, ghi đè tháng hiện tại.

### Chợ sinh viên
- Danh sách, tìm kiếm, lọc Pass đồ / Cho thuê, lọc trạng thái Đang bán / Đã bán.
- Lọc theo trường/KTX (KTX Khu A/B, Bách Khoa, Kinh tế Quốc dân, Quốc gia, FPT…);
  tin gần khu vực người dùng được ưu tiên lên trước.
- Đăng tin kèm tối đa 4 ảnh, danh mục, khu vực nhận hàng, số liên hệ.
- Trang chi tiết có gallery, nút Zalo/Gọi điện, gợi ý tin cùng danh mục.
- Chủ tin: đánh dấu **Đã bán** (giữ giá tham khảo), đăng bán lại, xóa tin.
- Hộp thoại hỏi người bán với câu hỏi nhanh; lưu lịch sử hỏi mua.
- Badge **Đã xác minh sinh viên** cho người bán đã xác thực.

### Gom đơn
- Danh sách, tìm kiếm, tab Tất cả / Đang mở / Đủ người / Kèo của tôi.
- Thẻ tiến độ thành viên, hạn chót, mức giảm giá và số tiền tiết kiệm cụ thể
  (ví dụ “Tiết kiệm 15.000 ₫ phí ship”, “Giảm 30%”).
- Tham gia / rời kèo; chủ kèo xóa kèo.
- **Công cụ chia tiền**: mỗi người chuyển bao nhiêu, chủ kèo nhận bao nhiêu,
  trạng thái đã chuyển/chưa chuyển, thông tin ngân hàng để copy.
- Tạo kèo mới với giá gốc, giá gom, phí ship tiết kiệm, ngân hàng, số người tối thiểu.

### Hồ sơ & thông báo
- Sửa họ tên, MSSV; lưu bền ở demo (`localStorage`) hoặc bảng `profiles` khi dùng Supabase.
- Hiển thị trạng thái xác minh (chờ duyệt / bị từ chối / đã xác minh), gửi lại yêu cầu xác minh.
- Chuông thông báo có đánh dấu đã đọc / đọc tất cả; toast realtime khi có người tham gia kèo,
  hỏi mua, hồ sơ mới, được duyệt/từ chối, bị khóa/mở khóa hoặc tố cáo được xử lý.
- Admin nhận thông báo riêng cho hồ sơ chờ duyệt và tố cáo mới.

## 4. Cấu trúc chính

```text
src/
  lib/
    budget.js        # engine tính ngân sách, heo đất, dự báo
    api.js           # lớp dữ liệu: Supabase hoặc localStorage
    demoData.js      # seed + persistence cho chế độ demo
    demoAuth.js      # tài khoản demo, phiên, duyệt/khóa, thông báo admin
    supabase.js      # createClient + isSupabaseConfigured
    upload.js        # upload ảnh tin đăng + ảnh thẻ (bucket riêng tư)
    image.js         # nén ảnh ở client trước khi lưu/upload
    storage.js       # đọc/ghi localStorage, writeStrict cho dữ liệu quan trọng
    campuses.js      # khu vực: bộ seed, slug tiếng Việt, chuẩn hoá bản ghi
  context/
    AuthContext.jsx  # phiên đăng nhập, role, xác minh, khóa tài khoản
    CampusContext.jsx # danh sách khu vực dùng chung + CRUD cho admin
  hooks/
    useBudgetStore.js
    useMarketplace.js
    useDeals.js
    useNotifications.js
    useCurrentUser.js
    useAdminUsers.js
    useReports.js
  pages/
    LandingPage.jsx
    LoginPage.jsx / RegisterPage.jsx
    DashboardPage.jsx
    ProfilePage.jsx
    VerificationPendingPage.jsx
    marketplace/ MarketplacePage, PostDetailPage, CreatePostPage
    group-deals/ GroupDealsPage, CreateDealPage
    admin/ AdminDashboardPage, AdminStudentsPage, AdminPostsPage, AdminReportsPage,
           AdminCampusesPage
  components/
    budget/ marketplace/ group/ layout/ reports/ ui/
    verification/ StudentCardUpload, StudentCardImage
supabase/
  schema.sql         # NGUỒN DUY NHẤT: bảng, RLS, RPC, trigger, realtime, storage
  README.md          # hướng dẫn cấu hình Supabase, tạo admin, duyệt sinh viên
```

## 5. Nối Supabase thật

Làm theo `supabase/README.md`:

1. Tạo project tại <https://supabase.com/dashboard>.
2. SQL Editor → dán toàn bộ `supabase/schema.sql` → Run.
3. Copy `Project URL` + `anon public key` vào `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-public-key>
   ```
4. Bật Email provider; có thể tắt Confirm email khi phát triển.
5. Khởi động lại dev server.

> Giá trị mẫu (`your-project`, `placeholder`, `your-anon`, `example.com`) bị coi là chưa cấu hình
> và app tự quay về chế độ demo.

## 6. Kiểm thử đã chạy

- `npm run build` thành công (chỉ còn cảnh báo chunk > 500 kB, không chặn build).
- Dashboard demo: hạn mức hôm nay 137.226 ₫, còn lại 107.226 ₫, heo đất 4.127.774 ₫,
  dự báo cuối tháng 4.235.000 ₫; bảo toàn `quỹ + heo đất + đã chi = 5.000.000 ₫`.
- Thêm chi tiêu thường → chuyển trạng thái đỏ khi vượt hạn mức; xóa → trở lại xanh.
- Thêm khoản đột xuất 500.000 ₫ → hạn mức giảm nhẹ và đều, không sụp về 0.
- Chợ: lọc Đã bán, đánh dấu đã bán, đăng bán lại, gửi câu hỏi cho người bán.
- Gom đơn: tham gia/rời kèo, tạo kèo, mở bảng chia tiền, xem trạng thái chuyển khoản.
- Thông báo: đọc tất cả, lưu trạng thái đã đọc.
  - Panel desktop mở dạng flyout ngay bên phải sidebar, dùng `createPortal` ra `document.body`
    để không bị `backdrop-blur` của sidebar cắt/méo vị trí `fixed`.
  - Animation mở panel rút còn 0,16 giây để không bị cảm giác trong suốt.
- Hồ sơ: đổi tên/MSSV, lưu, tải lại trang vẫn giữ; lời chào Dashboard cập nhật theo tên mới.
- Trang chủ `/`: không có sidebar, CTA và thẻ tính năng điều hướng đúng.
- Đăng xuất từ sidebar, menu mobile và Hồ sơ đều đưa về `/` và ẩn toàn bộ layout app.
- **Ba tầng quyền (demo):**
  - Khách vào `/dashboard` → chuyển `/login`.
  - Đăng nhập `cho@unisave.vn` → banner chờ duyệt; `/marketplace/new` hiện trang chờ duyệt.
  - Admin duyệt `cho@unisave.vn` → badge “Đã xác minh”, hết banner, vào được form đăng tin.
  - Đăng ký mới → tài khoản `pending`, admin nhận thông báo hồ sơ mới.
  - Sinh viên gửi tố cáo tin đăng → báo cáo mới + thông báo admin.
  - Admin xử lý tố cáo “khóa tài khoản” → tài khoản bị khóa, đăng nhập lại bị chặn.
  - Admin mở khóa → tài khoản đăng nhập lại bình thường.
  - Admin gỡ bài đăng → bài biến mất khỏi chợ, người đăng nhận thông báo kèm lý do.
- **Ảnh thẻ & đăng ký admin (demo):**
  - Đăng ký sinh viên kèm ảnh thẻ → tài khoản `pending` có `student_card_url` (data URL đã
    nén ~22 KB), admin nhận thông báo “Hồ sơ sinh viên mới cần duyệt”.
  - Đăng ký sinh viên không ảnh → thông báo admin ghi rõ “Hồ sơ chưa có ảnh thẻ sinh viên.”.
  - Đăng ký admin: không hiện MSSV/ảnh thẻ, mã mời sai bị chặn và không tạo tài khoản;
    mã `UNISAVE-ADMIN` tạo tài khoản `role = admin`, vào thẳng `/admin`.
  - Hồ sơ sinh viên: gửi xác minh khi thiếu ảnh bị chặn; tải ảnh → preview hiển thị,
    gửi yêu cầu thành công → `pending` + thông báo admin.
  - Admin: thấy thumbnail ảnh thẻ, mở ảnh lớn, tab **Thiếu ảnh thẻ** lọc đúng, modal duyệt
    hiển thị ảnh thẻ; duyệt → `approved` + thông báo cho sinh viên.
- **Cấu hình khu vực (demo, 13 bước tự động qua Chrome DevTools Protocol):** thêm
  “KTX Khu C” → hiện ngay trong danh sách admin, form đăng tin và form đăng ký; tạm ẩn → biến
  khỏi form đăng ký; bật lại → xuất hiện trở lại; xoá qua hộp thoại xác nhận kèm số dữ liệu
  đang dùng; nút xoá “Khu vực khác” bị vô hiệu hoá; không có lỗi runtime.
- Không thấy lỗi console trên các route đã kiểm tra.

## 7. Giới hạn còn lại

- Chưa thể kiểm thử end-to-end với Supabase thật vì `.env.local` còn thiếu
  `VITE_SUPABASE_ANON_KEY` (đã có URL và `SUPABASE_DB_URL`). Schema, bảng `campuses` + RLS
  đã chạy trên database thật; RPC và các luồng ghi qua client vẫn đối chiếu thủ công.
- Chưa tách bundle theo route; Vite cảnh báo chunk chính ~787 kB.
- Ảnh tin đăng trong chế độ demo vẫn dùng URL/placeholder; riêng ảnh thẻ sinh viên đã lưu
  data URL thật (đã nén) trong `localStorage`.
- Chế độ demo lưu tài khoản/mật khẩu trong `localStorage` để phục vụ trình diễn; dữ liệu chỉ
  đồng bộ trong cùng trình duyệt và không dùng cách này cho production.
