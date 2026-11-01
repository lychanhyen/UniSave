import clsx from 'clsx';

export function cn(...inputs) {
  return clsx(...inputs);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatCompact(amount) {
  const n = Number(amount) || 0;
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

export function formatNumber(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value) || 0);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date) {
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return '';
  const diff = Date.now() - time;
  if (diff < 60_000) return 'Vừa xong';
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return formatDate(date);
}

/**
 * Tin đăng chỉ hiện trên chợ trong 7 ngày để chợ không bị rối.
 * Dữ liệu không bị xoá: quản trị viên vẫn xem lại toàn bộ trong lịch sử.
 */
export const POST_VISIBLE_DAYS = 7;

export function isPostExpired(post) {
  const base = post?.bumped_at || post?.created_at;
  if (!base) return false;
  const created = new Date(base).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created > POST_VISIBLE_DAYS * 24 * 60 * 60 * 1000;
}

/** Số ngày còn lại trên chợ (0 = đã hết hạn). */
export function postDaysLeft(post) {
  const base = post?.bumped_at || post?.created_at;
  if (!base) return POST_VISIBLE_DAYS;
  const created = new Date(base).getTime();
  if (Number.isNaN(created)) return POST_VISIBLE_DAYS;
  const left = POST_VISIBLE_DAYS * 24 * 60 * 60 * 1000 - (Date.now() - created);
  return Math.max(0, Math.ceil(left / (24 * 60 * 60 * 1000)));
}

export function timeLeft(date) {
  const diff = new Date(date).getTime() - Date.now();
  if (Number.isNaN(diff)) return 'Không giới hạn';
  if (diff <= 0) return 'Đã hết hạn';
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return `${Math.max(1, Math.floor(diff / 60_000))} phút`;
  if (hours < 24) return `${hours} giờ`;
  const days = Math.floor(hours / 24);
  return `${days} ngày`;
}

export function daysInMonth(month, year = new Date().getFullYear()) {
  return new Date(year, month, 0).getDate();
}

export function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

export function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(monthKey) {
  const [year, month] = String(monthKey || currentMonthKey()).split('-').map(Number);
  return `Tháng ${month}/${year}`;
}

export function zaloLink(phone) {
  return `https://zalo.me/${String(phone || '').replace(/\D/g, '')}`;
}

export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function percentOf(part, total) {
  if (!total) return 0;
  return clamp(Math.round((part / total) * 100), 0, 100);
}
