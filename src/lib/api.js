import { supabase, isSupabaseConfigured } from './supabase';
import {
  loadPosts,
  savePosts,
  loadDeals,
  saveDeals,
  loadExpenses,
  saveExpenses,
  loadBudget,
  saveBudget,
  loadNotifications,
  saveNotifications,
  loadInquiries,
  saveInquiries,
  loadReports,
  saveReports,
  loadCampuses,
  saveCampuses,
  memberInfo,
  uid,
} from './demoData';
import {
  isProtectedCampus,
  normalizeCampus,
  sortCampuses,
  uniqueCampusSlug,
} from './campuses';
import {
  adminSetLockedDemo,
  adminSetVerificationDemo,
  listStudents,
  notifyAdmins,
  notifyUserDemo,
  requestVerificationDemo,
  updateOwnAccount,
} from './demoAuth';
import { uploadPrivateDataUrl } from './upload';

/**
 * Lớp dữ liệu dùng chung.
 *
 * - Khi chưa cấu hình Supabase: mọi thao tác chạy trên localStorage để app
 *   vẫn demo được đầy đủ.
 * - Khi đã cấu hình: đọc/ghi Supabase, kèm realtime ở tầng hook.
 */
export function isRemote() {
  return isSupabaseConfigured();
}

export function newId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return uid();
}

function unique(list) {
  return Array.from(new Set(list.filter(Boolean)));
}

async function fetchProfiles(ids) {
  const list = unique(ids);
  if (!list.length) return {};
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, is_verified, avatar_url, campus, student_code')
    .in('id', list);
  if (error) throw error;
  return Object.fromEntries((data || []).map((profile) => [profile.id, profile]));
}

function withOwner(row, profiles) {
  const owner = profiles[row.owner_id] || {};
  return {
    ...row,
    owner_name: owner.full_name || row.owner_name || 'Sinh viên UniSave',
    owner_verified: Boolean(owner.is_verified ?? row.owner_verified),
    owner_avatar: owner.avatar_url || row.owner_avatar || '',
    owner_campus: owner.campus || row.owner_campus || 'khac',
    images: Array.isArray(row.images) ? row.images : [],
    price: Number(row.price) || 0,
  };
}

/* ------------------------------- Marketplace ------------------------------ */

export async function fetchPosts() {
  if (!isRemote()) return loadPosts();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const profiles = await fetchProfiles((data || []).map((row) => row.owner_id));
  return (data || []).map((row) => withOwner(row, profiles));
}

export async function createPost(post) {
  if (!isRemote()) {
    const next = [post, ...loadPosts()];
    savePosts(next);
    return post;
  }
  const row = {
    id: post.id,
    owner_id: post.owner_id,
    title: post.title,
    description: post.description,
    type: post.type,
    price: post.price,
    category: post.category,
    images: post.images || [],
    contact: post.contact,
    location: post.location || 'khac',
    status: 'active',
  };
  const { data, error } = await supabase.from('posts').insert(row).select().single();
  if (error) throw error;
  return {
    ...data,
    owner_name: post.owner_name,
    owner_verified: post.owner_verified,
    owner_avatar: post.owner_avatar,
    price: Number(data.price) || 0,
    images: data.images || [],
  };
}

export async function updatePost(id, patch) {
  if (!isRemote()) {
    const next = loadPosts().map((post) => (post.id === id ? { ...post, ...patch } : post));
    savePosts(next);
    return next.find((post) => post.id === id);
  }
  const { data, error } = await supabase.from('posts').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deletePost(id) {
  if (!isRemote()) {
    savePosts(loadPosts().filter((post) => post.id !== id));
    return;
  }
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}

export async function createInquiry({ post, buyer, message }) {
  const item = {
    id: newId(),
    post_id: post.id,
    buyer_id: buyer.id,
    buyer_name: buyer.full_name,
    message,
    created_at: new Date().toISOString(),
  };
  if (!isRemote()) {
    saveInquiries([item, ...loadInquiries()]);
    return item;
  }
  const { data, error } = await supabase
    .from('post_inquiries')
    .insert({
      post_id: post.id,
      buyer_id: buyer.id,
      buyer_name: buyer.full_name,
      message,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* -------------------------------- Group deals ----------------------------- */

function mapDeal(row, participants, profiles) {
  const list = [...(participants || [])];
  if (!list.some((participant) => participant.user_id === row.owner_id)) {
    list.unshift({ user_id: row.owner_id, paid: true });
  }
  const members = list.map((participant) => {
    const profile = profiles[participant.user_id] || {};
    const fallback = memberInfo(participant.user_id);
    return {
      id: participant.user_id,
      name: profile.full_name || fallback.name,
      verified: Boolean(profile.is_verified ?? fallback.verified),
      is_owner: participant.user_id === row.owner_id,
      paid: Boolean(participant.paid),
    };
  });
  const owner = members.find((member) => member.is_owner) || {};
  const currentMembers = members.length;
  return {
    ...row,
    original_price: Number(row.original_price) || 0,
    deal_price: Number(row.deal_price) || 0,
    ship_saving: Number(row.ship_saving) || 0,
    min_members: Number(row.min_members) || 2,
    current_members: currentMembers,
    status: currentMembers >= (Number(row.min_members) || 2) ? 'full' : 'open',
    joined_ids: members.map((member) => member.id),
    paid_ids: members.filter((member) => member.paid).map((member) => member.id),
    members,
    owner_name: owner.name || row.owner_name || 'Sinh viên UniSave',
    owner_verified: Boolean(owner.verified ?? row.owner_verified),
  };
}

export async function fetchDeals() {
  if (!isRemote()) return loadDeals();
  const { data: deals, error } = await supabase
    .from('deals')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;

  const ids = (deals || []).map((deal) => deal.id);
  let participants = [];
  if (ids.length) {
    const { data, error: participantError } = await supabase
      .from('deal_participants')
      .select('deal_id, user_id, paid')
      .in('deal_id', ids);
    if (participantError) throw participantError;
    participants = data || [];
  }

  const profiles = await fetchProfiles([
    ...(deals || []).map((deal) => deal.owner_id),
    ...participants.map((participant) => participant.user_id),
  ]);

  const byDeal = participants.reduce((acc, participant) => {
    acc[participant.deal_id] = acc[participant.deal_id] || [];
    acc[participant.deal_id].push(participant);
    return acc;
  }, {});

  return (deals || []).map((deal) => mapDeal(deal, byDeal[deal.id], profiles));
}

export async function createDeal(deal) {
  if (!isRemote()) {
    const next = [deal, ...loadDeals()];
    saveDeals(next);
    return deal;
  }
  const row = {
    id: deal.id,
    owner_id: deal.owner_id,
    title: deal.title,
    description: deal.description,
    original_price: deal.original_price,
    deal_price: deal.deal_price,
    ship_saving: deal.ship_saving || 0,
    owner_bank: deal.owner_bank || '',
    min_members: deal.min_members,
    status: 'open',
    deadline: deal.deadline,
  };
  const { data, error } = await supabase.from('deals').insert(row).select().single();
  if (error) throw error;
  const { error: participantError } = await supabase.from('deal_participants').insert({
    deal_id: data.id,
    user_id: deal.owner_id,
    paid: true,
  });
  if (participantError) throw participantError;
  return mapDeal(data, [{ user_id: deal.owner_id, paid: true }], {
    [deal.owner_id]: {
      full_name: deal.owner_name,
      is_verified: deal.owner_verified,
    },
  });
}

export async function joinDealRemote(dealId, userId) {
  if (!isRemote()) return;
  const { error } = await supabase
    .from('deal_participants')
    .insert({ deal_id: dealId, user_id: userId });
  // 23505 = đã tham gia rồi, bỏ qua.
  if (error && error.code !== '23505') throw error;
}

export async function leaveDealRemote(dealId, userId) {
  if (!isRemote()) return;
  const { error } = await supabase
    .from('deal_participants')
    .delete()
    .eq('deal_id', dealId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function setDealPaidRemote(dealId, userId, paid) {
  if (!isRemote()) return;
  const { error } = await supabase
    .from('deal_participants')
    .update({ paid })
    .eq('deal_id', dealId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function deleteDeal(id) {
  if (!isRemote()) {
    saveDeals(loadDeals().filter((deal) => deal.id !== id));
    return;
  }
  const { error } = await supabase.from('deals').delete().eq('id', id);
  if (error) throw error;
}

/* --------------------------------- Budget --------------------------------- */

export async function fetchExpenses(userId) {
  if (!isRemote()) return loadExpenses();
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    ...row,
    amount: Number(row.amount) || 0,
    is_unexpected: Boolean(row.is_unexpected),
    date: String(row.date).slice(0, 10),
  }));
}

export async function createExpense(userId, expense) {
  if (!isRemote()) {
    const next = [expense, ...loadExpenses()];
    saveExpenses(next);
    return expense;
  }
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      id: expense.id,
      user_id: userId,
      amount: expense.amount,
      note: expense.note,
      category: expense.category,
      is_unexpected: Boolean(expense.is_unexpected),
      unexpected_reason: expense.unexpected_reason || null,
      date: expense.date,
    })
    .select()
    .single();
  if (error) throw error;
  return {
    ...data,
    amount: Number(data.amount) || 0,
    is_unexpected: Boolean(data.is_unexpected),
    date: String(data.date).slice(0, 10),
  };
}

export async function deleteExpense(id) {
  if (!isRemote()) {
    saveExpenses(loadExpenses().filter((expense) => expense.id !== id));
    return;
  }
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchBudget(userId, month) {
  if (!isRemote()) return loadBudget();
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    total_amount: Number(data.total_amount) || 0,
    total_days: Number(data.total_days) || 30,
    current_month: data.month,
  };
}

export async function saveBudgetRemote(userId, budget) {
  if (!isRemote()) {
    saveBudget(budget);
    return budget;
  }
  const { error } = await supabase.from('budgets').upsert(
    {
      user_id: userId,
      month: budget.current_month,
      total_amount: budget.total_amount,
      total_days: budget.total_days,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,month' }
  );
  if (error) throw error;
  return budget;
}

/* ------------------------------ Notifications ----------------------------- */

export async function fetchNotifications(userId) {
  // Guest chưa đăng nhập: không có recipient_id nên không được truy vấn UUID rỗng.
  if (!userId) return [];
  if (!isRemote()) return loadNotifications();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data || [];
}

export async function markNotificationRead(id) {
  if (!isRemote()) {
    saveNotifications(
      loadNotifications().map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    return;
  }
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId) {
  if (!isRemote()) {
    saveNotifications(loadNotifications().map((item) => ({ ...item, read: true })));
    return;
  }
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('recipient_id', userId)
    .eq('read', false);
  if (error) throw error;
}

/**
 * Trong chế độ Supabase, thông báo được tạo tự động bởi trigger trong
 * supabase/schema.sql (deal_participants, post_inquiries). Chế độ demo ghi
 * trực tiếp vào localStorage.
 */
export async function pushNotification(notification) {
  if (isRemote()) return null;
  saveNotifications([notification, ...loadNotifications()]);
  return notification;
}

/**
 * Gửi thông báo hệ thống tới một người dùng (dùng cho hành động của admin).
 * Chế độ Supabase ghi trực tiếp vào bảng notifications; RLS cho phép admin.
 */
export async function sendUserNotification(userId, { type, title, body, link }) {
  if (!userId) return null;
  if (!isRemote()) {
    notifyUserDemo(userId, { type, title, body, link });
    return true;
  }
  const { error } = await supabase.from('notifications').insert({
    recipient_id: userId,
    actor_id: null,
    actor_name: 'UniSave',
    type,
    title,
    body,
    link,
    read: false,
  });
  if (error) throw error;
  return true;
}

/* ------------------------------ Profiles / admin -------------------------- */

export async function fetchAccounts() {
  if (!isRemote()) return listStudents();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    ...row,
    role: row.role === 'admin' ? 'admin' : 'student',
    is_verified: Boolean(row.is_verified),
    is_locked: Boolean(row.is_locked),
    student_card_url: row.student_card_url || '',
    verification_status: row.verification_status || (row.is_verified ? 'approved' : 'none'),
  }));
}

/** Lưu ảnh thẻ sinh viên: demo trả data URL, Supabase trả đường dẫn bucket riêng tư. */
export async function uploadStudentCard(userId, dataUrl) {
  if (!dataUrl) return '';
  if (!isRemote()) return dataUrl;
  return uploadPrivateDataUrl('student-cards', userId, dataUrl, 'student-card');
}

/** Đổi đường dẫn ảnh thẻ thành URL xem được (signed URL khi dùng Supabase). */
export async function resolveStudentCardUrl(value) {
  if (!value) return '';
  if (value.startsWith('data:') || value.startsWith('http')) return value;
  if (!isRemote()) return value;
  const { data, error } = await supabase.storage
    .from('student-cards')
    .createSignedUrl(value, 60 * 60);
  if (error) throw error;
  return data?.signedUrl || '';
}

export async function updateOwnProfile(userId, patch) {
  if (!isRemote()) return updateOwnAccount(userId, patch);
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function requestVerification(userId) {
  if (!isRemote()) return requestVerificationDemo(userId);
  const { error } = await supabase.rpc('request_verification');
  if (error) throw error;
  return true;
}

export async function adminSetVerification(targetId, status, note, admin) {
  if (!isRemote()) return adminSetVerificationDemo(targetId, status, note, admin);
  const { error } = await supabase.rpc('admin_set_verification', {
    target_user: targetId,
    approve: status === 'approved',
    note: note || '',
  });
  if (error) throw error;
  return true;
}

export async function adminSetLocked(targetId, locked, note, admin) {
  if (!isRemote()) return adminSetLockedDemo(targetId, locked, note, admin);
  const { error } = await supabase.rpc('admin_set_locked', {
    target_user: targetId,
    locked: Boolean(locked),
    note: note || '',
  });
  if (error) throw error;
  return true;
}

/* -------------------------------- Reports -------------------------------- */

export async function fetchReports() {
  if (!isRemote()) return loadReports();
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createReport({ reporter, targetType, targetId, targetLabel, reason, details }) {
  const item = {
    id: newId(),
    reporter_id: reporter.id,
    reporter_name: reporter.full_name,
    target_type: targetType,
    target_id: targetId,
    target_label: targetLabel || '',
    reason,
    details: String(details || '').trim(),
    status: 'open',
    admin_note: '',
    action_taken: '',
    created_at: new Date().toISOString(),
    resolved_at: null,
  };

  if (!isRemote()) {
    const existing = loadReports();
    const duplicated = existing.some(
      (report) =>
        report.status === 'open' &&
        report.reporter_id === reporter.id &&
        report.target_type === targetType &&
        report.target_id === targetId
    );
    if (duplicated) {
      throw new Error('Bạn đã tố cáo nội dung này và đang chờ quản trị viên xử lý.');
    }
    saveReports([item, ...existing]);
    notifyAdmins({
      type: 'admin_report',
      title: `Tố cáo mới: ${reason}`,
      body: `${reporter.full_name} tố cáo ${
        targetType === 'post' ? 'tin đăng' : 'người dùng'
      } “${targetLabel || targetId}”.`,
      link: '/admin/reports',
    });
    return item;
  }

  const { data, error } = await supabase
    .from('reports')
    .insert({
      id: item.id,
      reporter_id: item.reporter_id,
      reporter_name: item.reporter_name,
      target_type: item.target_type,
      target_id: item.target_id,
      target_label: item.target_label,
      reason: item.reason,
      details: item.details,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function resolveReport(reportId, patch, admin) {
  if (!isRemote()) {
    let updated = null;
    const next = loadReports().map((report) => {
      if (report.id !== reportId) return report;
      updated = {
        ...report,
        ...patch,
        resolved_at: new Date().toISOString(),
        resolved_by: admin?.id || null,
      };
      return updated;
    });
    saveReports(next);
    if (updated) {
      saveNotifications([
        {
          id: newId(),
          recipient_id: updated.reporter_id,
          actor_id: null,
          actor_name: 'UniSave',
          type: 'report_resolved',
          title: 'Tố cáo của bạn đã được xử lý',
          body: patch.admin_note || 'Quản trị viên đã xem xét và xử lý tố cáo của bạn.',
          link: '/marketplace',
          read: false,
          created_at: new Date().toISOString(),
        },
        ...loadNotifications(),
      ]);
    }
    return updated;
  }

  const { data, error } = await supabase
    .from('reports')
    .update({
      ...patch,
      resolved_at: new Date().toISOString(),
      resolved_by: admin?.id || null,
    })
    .eq('id', reportId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* -------------------------------- Campuses ------------------------------- */

function assertCampusInput(input, list) {
  const label = String(input.label || '').trim();
  if (label.length < 2) throw new Error('Tên khu vực cần ít nhất 2 ký tự.');
  if (label.length > 60) throw new Error('Tên khu vực tối đa 60 ký tự.');
  if (String(input.area || '').trim().length > 80) {
    throw new Error('Mô tả vị trí tối đa 80 ký tự.');
  }
  const duplicated = list.find(
    (item) => item.label.toLowerCase() === label.toLowerCase() && item.value !== input.value
  );
  if (duplicated) throw new Error(`Đã có khu vực tên “${duplicated.label}”.`);
}

/** Danh sách khu vực cho form đăng ký, đăng tin và bộ lọc chợ. */
export async function fetchCampuses() {
  if (!isRemote()) return loadCampuses();
  const { data, error } = await supabase
    .from('campuses')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('label', { ascending: true });
  if (error) throw error;
  return sortCampuses((data || []).map(normalizeCampus));
}

export async function createCampus(input) {
  const list = await fetchCampuses();
  assertCampusInput(input, list);
  const value = uniqueCampusSlug(input.label, list);
  const sortOrder = Number.isFinite(Number(input.sort_order))
    ? Number(input.sort_order)
    : Math.max(0, ...list.map((item) => item.sort_order)) + 10;
  const payload = {
    value,
    label: String(input.label).trim(),
    area: String(input.area || '').trim(),
    kind: input.kind || 'other',
    sort_order: sortOrder,
    is_active: input.is_active !== false,
  };

  if (!isRemote()) {
    const created = normalizeCampus(payload);
    saveCampuses([...list, created]);
    return created;
  }

  const { data, error } = await supabase.from('campuses').insert(payload).select().single();
  if (error) throw error;
  return normalizeCampus(data);
}

export async function updateCampus(value, patch) {
  if (isProtectedCampus(value) && patch.is_active === false) {
    throw new Error('Không thể tắt khu vực mặc định. Hãy đổi tên hoặc sắp xếp lại thay vì tắt.');
  }
  const allowed = {};
  for (const key of ['label', 'area', 'kind', 'sort_order', 'is_active']) {
    if (patch[key] !== undefined) allowed[key] = patch[key];
  }
  if (allowed.label !== undefined) allowed.label = String(allowed.label).trim();
  if (allowed.area !== undefined) allowed.area = String(allowed.area).trim();
  if (allowed.sort_order !== undefined) allowed.sort_order = Number(allowed.sort_order) || 0;
  if (allowed.is_active !== undefined) allowed.is_active = Boolean(allowed.is_active);

  if (!isRemote()) {
    const list = loadCampuses();
    if (allowed.label !== undefined) assertCampusInput({ ...allowed, value }, list);
    const next = list.map((item) =>
      item.value === value ? normalizeCampus({ ...item, ...allowed }) : item
    );
    saveCampuses(next);
    return next.find((item) => item.value === value) || null;
  }

  if (allowed.label !== undefined) {
    const list = await fetchCampuses();
    assertCampusInput({ ...allowed, value }, list);
  }
  allowed.updated_at = new Date().toISOString();
  const { data, error } = await supabase
    .from('campuses')
    .update(allowed)
    .eq('value', value)
    .select()
    .single();
  if (error) throw error;
  return normalizeCampus(data);
}

export async function deleteCampus(value) {
  if (isProtectedCampus(value)) {
    throw new Error(
      'Không thể xoá khu vực “Khu vực khác” vì đây là giá trị dự phòng của hồ sơ và tin đăng cũ.'
    );
  }
  if (!isRemote()) {
    const list = loadCampuses();
    saveCampuses(list.filter((item) => item.value !== value));
    return true;
  }
  const { error } = await supabase.from('campuses').delete().eq('value', value);
  if (error) throw error;
  return true;
}

