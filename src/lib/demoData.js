import { read, write, uid } from './storage';
import { DEFAULT_CAMPUSES, normalizeCampus, sortCampuses } from './campuses';

export const DEMO_USER = {
  id: 'demo-user',
  email: 'sinhvien@unisave.vn',
  full_name: 'Nguyễn Minh Anh',
  student_code: '2251123456',
  campus: 'ktx-a',
  is_verified: true,
  verification_status: 'approved',
  is_locked: false,
  role: 'student',
  avatar_url: '',
};

/** Danh bạ thành viên demo để hiển thị tên trong công cụ chia tiền. */
export const DEMO_MEMBERS = {
  'demo-user': { name: DEMO_USER.full_name, verified: true },
  u1: { name: 'Trần Thu Hà', verified: true },
  u2: { name: 'Lê Quang Huy', verified: false },
  u3: { name: 'Phạm Gia Bảo', verified: true },
  u4: { name: 'Đỗ Khánh Linh', verified: true },
  u5: { name: 'Ngô Thanh Tùng', verified: false },
  u6: { name: 'Vũ Mai Chi', verified: true },
  u7: { name: 'Hoàng Anh Tuấn', verified: false },
  u8: { name: 'Bùi Thảo Vy', verified: true },
  u9: { name: 'Nguyễn Đức Long', verified: false },
  u10: { name: 'Lý Minh Châu', verified: true },
  u11: { name: 'Trịnh Quốc Bảo', verified: false },
  u12: { name: 'Phan Ngọc Hân', verified: true },
};

export function memberInfo(id) {
  return DEMO_MEMBERS[id] || { name: 'Sinh viên UniSave', verified: false };
}

export function getDealMembers(deal = {}) {
  const ids = Array.from(
    new Set([...(deal.joined_ids || []), deal.owner_id].filter(Boolean))
  );
  const paid = new Set(deal.paid_ids || []);
  const declared = new Set(deal.declared_ids || []);
  return ids.map((id) => {
    const info = memberInfo(id);
    const isPaid = paid.has(id);
    return {
      id,
      name: id === deal.owner_id ? deal.owner_name || info.name : info.name,
      verified: info.verified,
      is_owner: id === deal.owner_id,
      paid: isPaid,
      // Chế độ demo: chưa có bảng thanh toán nên suy ra từ danh sách id.
      payment_status: isPaid ? 'confirmed' : declared.has(id) ? 'declared' : 'unpaid',
    };
  });
}

function isoDaysAgo(days = 0, hours = 0) {
  return new Date(Date.now() - days * 86_400_000 - hours * 3_600_000).toISOString();
}

const POST_SEED = [
  {
    id: 'p1',
    title: 'Giáo trình Kinh tế vĩ mô - bản mới 95%',
    description:
      'Sách chính hãng mua ở nhà sách trường, chỉ gạch nhẹ vài chỗ. Phù hợp cho bạn nào học Kinh tế vĩ mô kỳ này. Có thể gửi qua ký túc xá.',
    type: 'pass',
    price: 65000,
    category: 'books',
    images: [],
    contact: '0987654321',
    location: 'ktx-a',
    status: 'active',
    owner_id: 'u1',
    owner_name: 'Trần Thu Hà',
    owner_verified: true,
    created_at: isoDaysAgo(0, 5),
  },
  {
    id: 'p2',
    title: 'Xe đạp thể thao cho thuê theo tháng',
    description:
      'Xe đạp Martin 700C, phanh đĩa, có giỏ và khóa. Cho thuê 250k/tháng, cọc 500k. Nhận xe tại khu vực Đại học Quốc gia.',
    type: 'rent',
    price: 250000,
    category: 'transport',
    images: [],
    contact: '0912345678',
    location: 'quoc-gia',
    status: 'active',
    owner_id: 'u2',
    owner_name: 'Lê Quang Huy',
    owner_verified: false,
    created_at: isoDaysAgo(1, 2),
  },
  {
    id: 'p3',
    title: 'Combo 3 áo sơ mi nam size M',
    description:
      'Áo mới 90%, màu trắng, xanh nhạt và be. Mặc vừa người 1m70 - 1m75. Bán combo vì chuyển trọ, không còn chỗ để.',
    type: 'pass',
    price: 180000,
    category: 'fashion',
    images: [],
    contact: '0977888999',
    location: 'ktx-b',
    status: 'active',
    owner_id: 'u3',
    owner_name: 'Phạm Gia Bảo',
    owner_verified: true,
    created_at: isoDaysAgo(2),
  },
  {
    id: 'p4',
    title: 'Máy tính Casio FX-580VN X chính hãng',
    description:
      'Máy còn bảo hành 6 tháng, đầy đủ hộp và sách hướng dẫn. Pin mới thay. Giá sinh viên, không thương lượng nhiều.',
    type: 'pass',
    price: 420000,
    category: 'electronics',
    images: [],
    contact: '0966111222',
    location: 'bach-khoa',
    status: 'active',
    owner_id: 'u4',
    owner_name: 'Đỗ Khánh Linh',
    owner_verified: true,
    created_at: isoDaysAgo(3),
  },
  {
    id: 'p5',
    title: 'Bàn phím cơ Akko 3068 - switch vàng',
    description:
      'Bàn phím nhỏ gọn 65%, gõ êm, đã lube switch. Tặng kèm keycap dự phòng. Ưu tiên bạn ở KTX Khu A qua thử trực tiếp.',
    type: 'pass',
    price: 550000,
    category: 'electronics',
    images: [],
    contact: '0987654321',
    location: 'ktx-a',
    status: 'active',
    owner_id: 'demo-user',
    owner_name: DEMO_USER.full_name,
    owner_verified: true,
    created_at: isoDaysAgo(0, 2),
  },
  {
    id: 'p6',
    title: 'Tai nghe Bluetooth JBL Tune 510BT',
    description:
      'Tai nghe đã bán cho bạn cùng lớp. Giữ lại tin để mọi người tham khảo giá thị trường đồ cũ trong trường.',
    type: 'pass',
    price: 350000,
    category: 'electronics',
    images: [],
    contact: '0977888999',
    location: 'kinh-te',
    status: 'sold',
    sold_at: isoDaysAgo(1, 4),
    owner_id: 'u3',
    owner_name: 'Phạm Gia Bảo',
    owner_verified: true,
    created_at: isoDaysAgo(5),
  },
];

const DEAL_SEED = [
  {
    id: 'd1',
    title: 'Gom đơn trà sữa Phúc Long - giảm 25%',
    description:
      'Mình gom đơn trà sữa Phúc Long cho cả ký túc xá. Đủ 10 ly sẽ được giảm 25% và freeship. Ai tham gia chuyển khoản trước 50%.',
    original_price: 45000,
    deal_price: 33000,
    ship_saving: 15000,
    owner_bank: 'Vietcombank · 0123456789',
    min_members: 10,
    current_members: 7,
    status: 'open',
    deadline: isoDaysAgo(-1, -6),
    owner_id: 'u1',
    owner_name: 'Trần Thu Hà',
    owner_verified: true,
    joined_ids: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'],
    paid_ids: ['u1', 'u2', 'u3'],
    created_at: isoDaysAgo(0, 8),
  },
  {
    id: 'd2',
    title: 'Mua chung giáo trình Nhập môn lập trình',
    description:
      'Nhóm mình cần 5 cuốn để được giá sỉ từ nhà sách. Ai học IT năm nhất thì tham gia nhé, chia nhau ship cho rẻ.',
    original_price: 120000,
    deal_price: 95000,
    ship_saving: 10000,
    owner_bank: 'MB Bank · 0988111222',
    min_members: 5,
    current_members: 5,
    status: 'full',
    deadline: isoDaysAgo(0, -12),
    owner_id: 'u5',
    owner_name: 'Ngô Thanh Tùng',
    owner_verified: false,
    joined_ids: ['u5', 'u6', 'u7', 'u8', 'u9'],
    paid_ids: ['u5', 'u6', 'u8'],
    created_at: isoDaysAgo(0, 20),
  },
  {
    id: 'd3',
    title: 'Gom đơn đồ ăn vặt ShopeeFood',
    description:
      'Gom đơn đồ ăn vặt cho buổi học nhóm tối nay. Đủ 8 người sẽ được mã giảm 40k. Mình đặt lúc 18h, ai tham gia trước 17h30 nhé.',
    original_price: 60000,
    deal_price: 42000,
    ship_saving: 8000,
    owner_bank: 'Techcombank · 19034567890',
    min_members: 8,
    current_members: 3,
    status: 'open',
    deadline: isoDaysAgo(0, -6),
    owner_id: 'u2',
    owner_name: 'Lê Quang Huy',
    owner_verified: true,
    joined_ids: ['u2', 'u3', 'u4'],
    paid_ids: ['u2'],
    created_at: isoDaysAgo(0, 2),
  },
  {
    id: 'd4',
    title: 'Gom cơm văn phòng cho buổi học nhóm',
    description:
      'Cả nhóm học môn Phân tích dữ liệu, mình đặt cơm cho 6 người để được freeship và giảm 20%. Ai tham gia chuyển khoản cho mình trước 11h nhé.',
    original_price: 45000,
    deal_price: 36000,
    ship_saving: 15000,
    owner_bank: 'Vietcombank · 0987654321',
    min_members: 6,
    current_members: 4,
    status: 'open',
    deadline: isoDaysAgo(0, -20),
    owner_id: 'demo-user',
    owner_name: DEMO_USER.full_name,
    owner_verified: true,
    joined_ids: ['demo-user', 'u2', 'u5', 'u8'],
    paid_ids: ['demo-user', 'u2'],
    created_at: isoDaysAgo(0, 1),
  },
];

const NOTIFICATION_SEED = [
  {
    id: 'n1',
    recipient_id: 'demo-user',
    actor_id: 'u2',
    actor_name: 'Lê Quang Huy',
    type: 'post_inquiry',
    title: 'Lê Quang Huy hỏi mua bàn phím của bạn',
    body: '“Bàn phím còn bảo hành không bạn? Mình ở KTX Khu B, qua thử được không?”',
    link: '/marketplace/p5',
    read: false,
    created_at: isoDaysAgo(0, 1),
  },
  {
    id: 'n2',
    recipient_id: 'demo-user',
    actor_id: 'u8',
    actor_name: 'Bùi Thảo Vy',
    type: 'deal_join',
    title: 'Bùi Thảo Vy đã tham gia kèo của bạn',
    body: 'Kèo “Gom cơm văn phòng cho buổi học nhóm” hiện có 4/6 người.',
    link: '/deals',
    read: false,
    created_at: isoDaysAgo(0, 3),
  },
  {
    id: 'n3',
    recipient_id: 'demo-user',
    actor_id: null,
    actor_name: 'UniSave',
    type: 'system',
    title: 'Heo đất của bạn đang lớn dần 🐷',
    body: 'Bạn đã chi ít hơn hạn mức 3 ngày liên tiếp. Mở Dashboard để xem dự báo cuối tháng.',
    link: '/dashboard',
    read: true,
    created_at: isoDaysAgo(1),
  },
  {
    id: 'n4',
    recipient_id: 'demo-pending',
    actor_id: null,
    actor_name: 'UniSave',
    type: 'system',
    title: 'Hồ sơ của bạn đang chờ duyệt',
    body: 'Quản trị viên sẽ kiểm tra thẻ sinh viên và duyệt trong thời gian sớm nhất.',
    link: '/profile',
    read: false,
    created_at: isoDaysAgo(1, 2),
  },
  {
    id: 'n5',
    recipient_id: 'demo-admin',
    actor_id: null,
    actor_name: 'UniSave',
    type: 'admin_verification',
    title: '3 hồ sơ sinh viên đang chờ duyệt',
    body: 'Phạm Thu Trang, Lê Quang Huy và Ngô Thanh Tùng đã gửi yêu cầu xác minh.',
    link: '/admin/students',
    read: false,
    created_at: isoDaysAgo(0, 2),
  },
  {
    id: 'n6',
    recipient_id: 'demo-admin',
    actor_id: null,
    actor_name: 'UniSave',
    type: 'admin_report',
    title: 'Có 2 tố cáo mới cần xử lý',
    body: 'Một tố cáo tin đăng và một tố cáo người dùng đang ở trạng thái chờ.',
    link: '/admin/reports',
    read: false,
    created_at: isoDaysAgo(0, 4),
  },
];

const REPORT_SEED = [
  {
    id: 'r1',
    reporter_id: 'u2',
    reporter_name: 'Lê Quang Huy',
    target_type: 'post',
    target_id: 'p2',
    target_label: 'Xe đạp thể thao cho thuê theo tháng',
    reason: 'Hàng không đúng mô tả',
    details:
      'Ảnh trong tin là xe phanh đĩa, nhưng khi qua xem thì là xe phanh thường và vành bị gỉ. Mong admin kiểm tra lại.',
    status: 'open',
    admin_note: '',
    action_taken: '',
    created_at: isoDaysAgo(0, 4),
    resolved_at: null,
  },
  {
    id: 'r2',
    reporter_id: 'u8',
    reporter_name: 'Bùi Thảo Vy',
    target_type: 'user',
    target_id: 'u7',
    target_label: 'Hoàng Anh Tuấn',
    reason: 'Lừa đảo đặt cọc',
    details:
      'Bạn này nhận 200.000đ tiền cọc mua giáo trình rồi chặn tin nhắn Zalo. Mình có ảnh chụp chuyển khoản và đoạn chat.',
    status: 'open',
    admin_note: '',
    action_taken: '',
    created_at: isoDaysAgo(1, 1),
    resolved_at: null,
  },
  {
    id: 'r3',
    reporter_id: 'u1',
    reporter_name: 'Trần Thu Hà',
    target_type: 'post',
    target_id: 'p6',
    target_label: 'Tai nghe Bluetooth JBL Tune 510BT',
    reason: 'Spam/quảng cáo',
    details: 'Tin đã bán nhưng vẫn hiện lên đầu trang.',
    status: 'resolved',
    admin_note: 'Đã kiểm tra: tin ở trạng thái Đã bán, chỉ nhắc nhở người đăng.',
    action_taken: 'none',
    created_at: isoDaysAgo(4),
    resolved_at: isoDaysAgo(3),
  },
];

function normalizePost(post) {
  const status = post.status === 'done' ? 'sold' : post.status || 'active';
  return {
    ...post,
    status,
    location: post.location || 'khac',
    images: Array.isArray(post.images) ? post.images : [],
    owner_verified: Boolean(post.owner_verified),
  };
}

function normalizeDeal(deal) {
  const joinedIds = Array.isArray(deal.joined_ids) ? deal.joined_ids : [deal.owner_id].filter(Boolean);
  return {
    ...deal,
    joined_ids: joinedIds,
    paid_ids: Array.isArray(deal.paid_ids) ? deal.paid_ids : [],
    current_members: joinedIds.length || Number(deal.current_members) || 0,
    ship_saving: Number(deal.ship_saving) || 0,
    owner_bank: deal.owner_bank || '',
    status: joinedIds.length >= (Number(deal.min_members) || 2) ? 'full' : deal.status || 'open',
  };
}

function normalizeExpense(expense) {
  return {
    ...expense,
    is_unexpected: Boolean(expense.is_unexpected),
    unexpected_reason: expense.unexpected_reason || '',
  };
}

export function loadPosts() {
  const existing = read('posts', null);
  if (Array.isArray(existing)) return existing.map(normalizePost);
  write('posts', POST_SEED);
  return POST_SEED.map(normalizePost);
}

export function savePosts(posts) {
  write('posts', posts);
}

export function loadDeals() {
  const existing = read('deals', null);
  if (Array.isArray(existing)) return existing.map(normalizeDeal);
  write('deals', DEAL_SEED);
  return DEAL_SEED.map(normalizeDeal);
}

export function saveDeals(deals) {
  write('deals', deals);
}

function seedExpenses() {
  const now = new Date();
  const make = (daysAgo, note, category, amount, unexpected = false, reason = '') => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return {
      id: `seed-${daysAgo}-${amount}`,
      note,
      category,
      amount,
      is_unexpected: unexpected,
      unexpected_reason: reason,
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`,
    };
  };

  return [
    make(0, 'Cà phê sáng', 'food', 25000),
    make(0, 'Gửi xe buổi học', 'travel', 5000),
    make(1, 'Cơm trưa căn tin', 'food', 35000),
    make(1, 'In bài tập nhóm', 'other', 15000),
    make(2, 'Sách tham khảo Kinh tế', 'books', 120000),
    make(2, 'Sửa xe đạp', 'other', 180000, true, 'Sửa xe'),
    make(3, 'Trà sữa với bạn', 'food', 45000),
    make(4, 'Vé xe buýt tháng', 'travel', 100000),
    make(5, 'Áo thun basic', 'shopping', 150000),
    make(6, 'Xem phim cuối tuần', 'entertainment', 90000),
  ];
}

export function loadExpenses() {
  const existing = read('expenses', null);
  if (Array.isArray(existing)) return existing.map(normalizeExpense);
  const seeded = seedExpenses();
  write('expenses', seeded);
  return seeded;
}

export function saveExpenses(list) {
  write('expenses', list);
}

export function loadBudget() {
  const existing = read('budget', null);
  if (existing) return existing;
  const now = new Date();
  const seeded = {
    total_amount: 5000000,
    total_days: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
    current_month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
  };
  write('budget', seeded);
  return seeded;
}

export function saveBudget(budget) {
  write('budget', budget);
}

export function loadNotifications() {
  const existing = read('notifications', null);
  if (Array.isArray(existing)) return existing;
  write('notifications', NOTIFICATION_SEED);
  return NOTIFICATION_SEED;
}

export function saveNotifications(list) {
  write('notifications', list);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('unisave:notifications'));
  }
}

export function loadInquiries() {
  const existing = read('inquiries', null);
  return Array.isArray(existing) ? existing : [];
}

export function saveInquiries(list) {
  write('inquiries', list);
}

export function loadComments() {
  const existing = read('comments', null);
  return Array.isArray(existing) ? existing : [];
}

export function saveComments(list) {
  write('comments', list);
}
export function loadIncomes() {
  const existing = read('incomes', null);
  return Array.isArray(existing) ? existing : [];
}

export function saveIncomes(list) {
  write('incomes', list);
}

export function loadFeedback() {
  const existing = read('feedback', null);
  return Array.isArray(existing) ? existing : [];
}

export function saveFeedback(list) {
  write('feedback', list);
}

/* -------------------------------- Campuses ------------------------------- */

/**
 * Danh sách khu vực ở chế độ demo. Lần đầu chạy sẽ seed bằng bộ mặc định để
 * trang quản trị có sẵn dữ liệu mà sửa, sau đó mọi thay đổi nằm trong
 * localStorage và phát sự kiện để các component khác cập nhật theo.
 */
export function loadCampuses() {
  const existing = read('campuses', null);
  if (Array.isArray(existing) && existing.length) return sortCampuses(existing.map(normalizeCampus));
  const seeded = sortCampuses(DEFAULT_CAMPUSES.map(normalizeCampus));
  write('campuses', seeded);
  return seeded;
}

export function saveCampuses(list) {
  const normalized = sortCampuses(list.map(normalizeCampus));
  write('campuses', normalized);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('unisave:campuses'));
  }
  return normalized;
}

/* -------------------------------- Reports -------------------------------- */

export function loadReports() {
  const existing = read('reports', null);
  if (Array.isArray(existing)) return existing;
  write('reports', REPORT_SEED);
  return REPORT_SEED;
}

export function saveReports(list) {
  write('reports', list);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('unisave:reports'));
  }
}

/** Hồ sơ demo được chỉnh sửa ở trang cá nhân (localStorage). */
export function loadProfile() {
  const existing = read('profile', null);
  return existing && typeof existing === 'object' ? existing : {};
}

export function saveProfile(patch) {
  const next = { ...loadProfile(), ...patch };
  write('profile', next);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('unisave:profile'));
  }
  return next;
}

export { uid };
