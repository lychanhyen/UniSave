import { read, write, writeStrict, uid } from './storage';
import { loadNotifications, saveNotifications } from './demoData';

/**
 * Xác thực cho chế độ demo (chưa cấu hình Supabase).
 *
 * Tài khoản được lưu trong localStorage `unisave:accounts`, phiên đăng nhập
 * trong `unisave:session`. Nhờ vậy có thể mô phỏng đầy đủ 3 tầng quyền:
 * vãng lai – sinh viên – quản trị viên, kèm duyệt xác minh và khóa tài khoản.
 */

const ACCOUNTS_KEY = 'accounts';
const SESSION_KEY = 'session';

/**
 * Mã mời tạo tài khoản quản trị ở chế độ demo. Chỉ dùng cho mục đích trình diễn;
 * khi chạy Supabase thật, quản trị viên được tạo bằng SQL (xem supabase/README.md).
 */
export const ADMIN_INVITE_CODE = 'UNISAVE-ADMIN';

const DAY = 86_400_000;
const now = Date.now();

function daysAgo(days = 0, hours = 0) {
  return new Date(now - days * DAY - hours * 3_600_000).toISOString();
}

const SEED_ACCOUNTS = [
  {
    id: 'demo-user',
    email: 'sinhvien@unisave.vn',
    password: '123456',
    full_name: 'Nguyễn Minh Anh',
    student_code: '2251123456',
    campus: 'ktx-a',
    avatar_url: '',
    role: 'student',
    is_verified: true,
    verification_status: 'approved',
    verification_note: 'Thẻ sinh viên hợp lệ, đã đối chiếu ảnh chân dung.',
    is_locked: false,
    created_at: daysAgo(32),
    verified_at: daysAgo(30),
  },
  {
    id: 'demo-pending',
    email: 'cho@unisave.vn',
    password: '123456',
    full_name: 'Phạm Thu Trang',
    student_code: '2351098765',
    campus: 'ktx-b',
    avatar_url: '',
    role: 'student',
    is_verified: false,
    verification_status: 'pending',
    verification_note: '',
    is_locked: false,
    created_at: daysAgo(1, 3),
    verified_at: null,
  },
  {
    id: 'demo-admin',
    email: 'admin@unisave.vn',
    password: '123456',
    full_name: 'Quản trị UniSave',
    student_code: '',
    campus: 'khac',
    avatar_url: '',
    role: 'admin',
    is_verified: true,
    verification_status: 'approved',
    verification_note: 'Tài khoản quản trị hệ thống.',
    is_locked: false,
    created_at: daysAgo(60),
    verified_at: daysAgo(60),
  },
  {
    id: 'u1',
    email: 'thuha@unisave.vn',
    password: '123456',
    full_name: 'Trần Thu Hà',
    student_code: '2251001122',
    campus: 'ktx-a',
    avatar_url: '',
    role: 'student',
    is_verified: true,
    verification_status: 'approved',
    verification_note: '',
    is_locked: false,
    created_at: daysAgo(40),
    verified_at: daysAgo(38),
  },
  {
    id: 'u2',
    email: 'quanghuy@unisave.vn',
    password: '123456',
    full_name: 'Lê Quang Huy',
    student_code: '2251002233',
    campus: 'ktx-b',
    avatar_url: '',
    role: 'student',
    is_verified: false,
    verification_status: 'pending',
    verification_note: '',
    is_locked: false,
    created_at: daysAgo(2, 5),
    verified_at: null,
  },
  {
    id: 'u3',
    email: 'giabao@unisave.vn',
    password: '123456',
    full_name: 'Phạm Gia Bảo',
    student_code: '2151003344',
    campus: 'ktx-b',
    avatar_url: '',
    role: 'student',
    is_verified: true,
    verification_status: 'approved',
    verification_note: '',
    is_locked: false,
    created_at: daysAgo(50),
    verified_at: daysAgo(48),
  },
  {
    id: 'u4',
    email: 'khanhlinh@unisave.vn',
    password: '123456',
    full_name: 'Đỗ Khánh Linh',
    student_code: '2251009988',
    campus: 'bach-khoa',
    avatar_url: '',
    role: 'student',
    is_verified: true,
    verification_status: 'approved',
    verification_note: '',
    is_locked: false,
    created_at: daysAgo(45),
    verified_at: daysAgo(43),
  },
  {
    id: 'u5',
    email: 'thanhtung@unisave.vn',
    password: '123456',
    full_name: 'Ngô Thanh Tùng',
    student_code: '2251004455',
    campus: 'bach-khoa',
    avatar_url: '',
    role: 'student',
    is_verified: false,
    verification_status: 'pending',
    verification_note: '',
    is_locked: false,
    created_at: daysAgo(3, 2),
    verified_at: null,
  },
  {
    id: 'u7',
    email: 'anhtuan@unisave.vn',
    password: '123456',
    full_name: 'Hoàng Anh Tuấn',
    student_code: '2151005566',
    campus: 'kinh-te',
    avatar_url: '',
    role: 'student',
    is_verified: false,
    verification_status: 'rejected',
    verification_note: 'Ảnh thẻ sinh viên bị mờ, không đọc được mã số. Vui lòng gửi lại ảnh rõ hơn.',
    is_locked: false,
    created_at: daysAgo(6),
    verified_at: null,
  },
  {
    id: 'u8',
    email: 'thaovy@unisave.vn',
    password: '123456',
    full_name: 'Bùi Thảo Vy',
    student_code: '2351006677',
    campus: 'ktx-a',
    avatar_url: '',
    role: 'student',
    is_verified: true,
    verification_status: 'approved',
    verification_note: '',
    is_locked: false,
    created_at: daysAgo(20),
    verified_at: daysAgo(18),
  },
  {
    id: 'u9',
    email: 'duclong@unisave.vn',
    password: '123456',
    full_name: 'Nguyễn Đức Long',
    student_code: '2151007788',
    campus: 'quoc-gia',
    avatar_url: '',
    role: 'student',
    is_verified: true,
    verification_status: 'approved',
    verification_note: 'Đã xác minh. Tài khoản bị khóa do vi phạm quy định giao dịch.',
    is_locked: true,
    created_at: daysAgo(25),
    verified_at: daysAgo(24),
  },
];

function normalizeAccount(account) {
  const status =
    account.verification_status ||
    (account.is_verified ? 'approved' : account.is_locked ? 'none' : 'pending');
  return {
    ...account,
    role: account.role === 'admin' ? 'admin' : 'student',
    verification_status: status,
    is_verified: Boolean(account.is_verified || status === 'approved'),
    is_locked: Boolean(account.is_locked),
    verification_note: account.verification_note || '',
    campus: account.campus || 'khac',
    avatar_url: account.avatar_url || '',
    student_card_url: account.student_card_url || '',
  };
}

function emit() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('unisave:accounts'));
}

function emitSession() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('unisave:session'));
}

export function loadAccounts() {
  const existing = read(ACCOUNTS_KEY, null);
  if (Array.isArray(existing) && existing.length) {
    return existing.map(normalizeAccount);
  }
  const seeded = SEED_ACCOUNTS.map(normalizeAccount);
  write(ACCOUNTS_KEY, seeded);
  return seeded;
}

export function saveAccounts(accounts) {
  try {
    writeStrict(ACCOUNTS_KEY, accounts);
  } catch {
    throw new Error(
      'Bộ nhớ trình duyệt đã đầy nên không lưu được tài khoản/ảnh thẻ. Hãy xóa bớt ảnh hoặc dùng Supabase.'
    );
  }
  emit();
}

export function publicAccount(account) {
  if (!account) return null;
  const { password, ...safe } = account;
  return safe;
}

export function findAccount(id) {
  return loadAccounts().find((account) => account.id === id) || null;
}

export function findAccountByEmail(email) {
  const value = String(email || '').trim().toLowerCase();
  return loadAccounts().find((account) => account.email.toLowerCase() === value) || null;
}

export function listStudents() {
  return loadAccounts()
    .filter((account) => account.role === 'student')
    .map(publicAccount)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function listAdmins() {
  return loadAccounts().filter((account) => account.role === 'admin' && !account.is_locked);
}

/* ------------------------------- Session -------------------------------- */

export function getSessionAccount() {
  const session = read(SESSION_KEY, null);
  if (!session?.userId) return null;
  return findAccount(session.userId);
}

export function setSession(userId) {
  write(SESSION_KEY, { userId, loggedInAt: new Date().toISOString() });
  emitSession();
}

export function clearSession() {
  write(SESSION_KEY, null);
  emitSession();
}

export function loginDemo(email, password) {
  const account = findAccountByEmail(email);
  if (!account || account.password !== password) {
    throw new Error('Email hoặc mật khẩu không đúng.');
  }
  if (account.is_locked) {
    throw new Error(
      'Tài khoản của bạn đã bị khóa do vi phạm quy định. Liên hệ quản trị viên UniSave để được hỗ trợ.'
    );
  }
  setSession(account.id);
  return publicAccount(account);
}

export function registerDemo({
  fullName,
  email,
  password,
  studentCode,
  campus,
  role = 'student',
  studentCardUrl = '',
  inviteCode = '',
}) {
  const value = String(email || '').trim().toLowerCase();
  if (!value) throw new Error('Vui lòng nhập email.');
  if (String(password || '').length < 6) throw new Error('Mật khẩu cần ít nhất 6 ký tự.');
  if (findAccountByEmail(value)) throw new Error('Email này đã được đăng ký.');

  const isAdmin = role === 'admin';
  if (isAdmin && String(inviteCode || '').trim().toUpperCase() !== ADMIN_INVITE_CODE) {
    throw new Error('Mã mời quản trị không đúng. Liên hệ quản trị viên hệ thống.');
  }

  const account = normalizeAccount({
    id: uid(),
    email: value,
    password,
    full_name: String(fullName || '').trim() || (isAdmin ? 'Quản trị UniSave' : 'Sinh viên UniSave'),
    student_code: isAdmin ? '' : String(studentCode || '').trim(),
    campus: isAdmin ? 'khac' : campus || 'khac',
    avatar_url: '',
    student_card_url: isAdmin ? '' : studentCardUrl,
    role: isAdmin ? 'admin' : 'student',
    is_verified: isAdmin,
    verification_status: isAdmin ? 'approved' : 'pending',
    verification_note: isAdmin ? 'Tài khoản quản trị được tạo bằng mã mời.' : '',
    is_locked: false,
    created_at: new Date().toISOString(),
    verified_at: isAdmin ? new Date().toISOString() : null,
  });

  saveAccounts([account, ...loadAccounts()]);
  setSession(account.id);

  if (isAdmin) {
    notifyAdmins({
      type: 'system',
      title: 'Quản trị viên mới',
      body: `${account.full_name} vừa tạo tài khoản quản trị bằng mã mời.`,
      link: '/admin/students',
      excludeId: account.id,
    });
  } else {
    notifyAdmins({
      type: 'admin_verification',
      title: 'Hồ sơ sinh viên mới cần duyệt',
      body: `${account.full_name} (${account.student_code || 'chưa có MSSV'}) vừa đăng ký và đang chờ xác minh.${
        account.student_card_url ? '' : ' Hồ sơ chưa có ảnh thẻ sinh viên.'
      }`,
      link: '/admin/students',
      excludeId: account.id,
    });
  }
  return publicAccount(account);
}

/* --------------------------- Profile updates ---------------------------- */

export function updateOwnAccount(id, patch) {
  const allowed = ['full_name', 'student_code', 'campus', 'avatar_url', 'student_card_url'];
  const safePatch = Object.fromEntries(
    Object.entries(patch || {}).filter(([key]) => allowed.includes(key))
  );
  let updated = null;
  saveAccounts(
    loadAccounts().map((account) => {
      if (account.id !== id) return account;
      updated = { ...account, ...safePatch };
      return updated;
    })
  );
  return updated ? publicAccount(updated) : null;
}

export function requestVerificationDemo(id) {
  const account = findAccount(id);
  if (!account) throw new Error('Không tìm thấy tài khoản.');
  if (account.is_verified) return publicAccount(account);
  if (account.is_locked) throw new Error('Tài khoản đang bị khóa, không thể gửi yêu cầu.');
  if (!account.student_card_url) {
    throw new Error('Vui lòng tải ảnh thẻ sinh viên trước khi gửi yêu cầu xác minh.');
  }

  let updated = null;
  saveAccounts(
    loadAccounts().map((item) => {
      if (item.id !== id) return item;
      updated = {
        ...item,
        verification_status: 'pending',
        verification_note: '',
      };
      return updated;
    })
  );

  notifyAdmins({
    type: 'admin_verification',
    title: 'Yêu cầu xác minh mới',
    body: `${updated.full_name} đã gửi lại yêu cầu xác minh sinh viên.`,
    link: '/admin/students',
  });
  return publicAccount(updated);
}

/* ----------------------------- Admin actions ---------------------------- */

export function notifyAdmins({ type = 'admin_report', title, body, link, excludeId = null }) {
  const admins = listAdmins().filter((admin) => admin.id !== excludeId);
  if (!admins.length) return;
  const items = admins.map((admin) => ({
    id: uid(),
    recipient_id: admin.id,
    actor_id: null,
    actor_name: 'UniSave',
    type,
    title,
    body,
    link,
    read: false,
    created_at: new Date().toISOString(),
  }));
  saveNotifications([...items, ...loadNotifications()]);
}

function notifyUser(userId, { type, title, body, link }) {
  if (!userId) return;
  saveNotifications([
    {
      id: uid(),
      recipient_id: userId,
      actor_id: null,
      actor_name: 'UniSave',
      type,
      title,
      body,
      link,
      read: false,
      created_at: new Date().toISOString(),
    },
    ...loadNotifications(),
  ]);
}

export function notifyUserDemo(userId, payload) {
  notifyUser(userId, payload);
}

export function adminSetVerificationDemo(targetId, status, note, admin) {
  const target = findAccount(targetId);
  if (!target) throw new Error('Không tìm thấy sinh viên.');
  if (target.role === 'admin') throw new Error('Không thể thay đổi xác minh của quản trị viên.');

  const nextStatus = ['approved', 'rejected', 'pending', 'none'].includes(status)
    ? status
    : 'pending';
  let updated = null;
  saveAccounts(
    loadAccounts().map((account) => {
      if (account.id !== targetId) return account;
      updated = {
        ...account,
        verification_status: nextStatus,
        is_verified: nextStatus === 'approved',
        verification_note: note || '',
        verified_at: nextStatus === 'approved' ? new Date().toISOString() : null,
        verified_by: admin?.id || null,
      };
      return updated;
    })
  );

  if (nextStatus === 'approved') {
    notifyUser(targetId, {
      type: 'verification_approved',
      title: 'Hồ sơ sinh viên đã được duyệt 🎉',
      body: 'Bạn đã nhận huy hiệu “Đã xác minh sinh viên” và có thể đăng tin, tạo kèo gom đơn.',
      link: '/profile',
    });
  } else if (nextStatus === 'rejected') {
    notifyUser(targetId, {
      type: 'verification_rejected',
      title: 'Yêu cầu xác minh chưa được duyệt',
      body: note || 'Hồ sơ chưa đủ điều kiện. Vui lòng kiểm tra lại thông tin và gửi lại yêu cầu.',
      link: '/profile',
    });
  }

  return publicAccount(updated);
}

export function adminSetLockedDemo(targetId, locked, note, admin) {
  const target = findAccount(targetId);
  if (!target) throw new Error('Không tìm thấy tài khoản.');
  if (target.role === 'admin') throw new Error('Không thể khóa tài khoản quản trị viên.');

  let updated = null;
  saveAccounts(
    loadAccounts().map((account) => {
      if (account.id !== targetId) return account;
      updated = {
        ...account,
        is_locked: Boolean(locked),
        locked_at: locked ? new Date().toISOString() : null,
        locked_by: locked ? admin?.id || null : null,
        verification_note: note || account.verification_note,
      };
      return updated;
    })
  );

  notifyUser(targetId, {
    type: locked ? 'account_locked' : 'account_unlocked',
    title: locked ? 'Tài khoản của bạn đã bị khóa' : 'Tài khoản của bạn đã được mở khóa',
    body: locked
      ? note || 'Tài khoản bị khóa do vi phạm quy định cộng đồng. Liên hệ quản trị viên để được hỗ trợ.'
      : 'Bạn có thể tiếp tục sử dụng UniSave. Hãy tuân thủ quy định cộng đồng nhé.',
    link: locked ? '/' : '/dashboard',
  });

  return publicAccount(updated);
}
