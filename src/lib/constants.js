import {
  UtensilsCrossed,
  BookOpen,
  Bus,
  Gamepad2,
  ShoppingBag,
  Receipt,
  Laptop,
  Shirt,
  Bike,
  Sofa,
  Package,
} from 'lucide-react';

export const CATEGORIES = [
  { value: 'food', label: 'Ăn uống', icon: UtensilsCrossed, tone: 'amber' },
  { value: 'books', label: 'Sách vở', icon: BookOpen, tone: 'blue' },
  { value: 'travel', label: 'Đi lại', icon: Bus, tone: 'violet' },
  { value: 'entertainment', label: 'Giải trí', icon: Gamepad2, tone: 'pink' },
  { value: 'shopping', label: 'Mua sắm', icon: ShoppingBag, tone: 'emerald' },
  { value: 'other', label: 'Khác', icon: Receipt, tone: 'slate' },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c])
);

export const TONES = {
  amber: 'bg-amber-50 text-amber-600',
  blue: 'bg-blue-50 text-blue-600',
  violet: 'bg-violet-50 text-violet-600',
  pink: 'bg-pink-50 text-pink-600',
  emerald: 'bg-brand-50 text-brand-600',
  slate: 'bg-ink-100 text-ink-600',
};

export const POST_TYPES = [
  { value: 'pass', label: 'Pass đồ' },
  { value: 'rent', label: 'Cho thuê' },
];

export const POST_CATEGORIES = [
  { value: 'books', label: 'Sách & giáo trình', icon: BookOpen, tone: 'blue' },
  { value: 'electronics', label: 'Đồ điện tử', icon: Laptop, tone: 'violet' },
  { value: 'fashion', label: 'Quần áo', icon: Shirt, tone: 'pink' },
  { value: 'transport', label: 'Xe cộ', icon: Bike, tone: 'amber' },
  { value: 'furniture', label: 'Đồ dùng', icon: Sofa, tone: 'emerald' },
  { value: 'other', label: 'Khác', icon: Package, tone: 'slate' },
];

export const POST_CATEGORY_MAP = Object.fromEntries(
  POST_CATEGORIES.map((c) => [c.value, c])
);

export const POST_GRADIENTS = {
  blue: 'from-blue-500 via-blue-600 to-indigo-700',
  violet: 'from-violet-500 via-purple-600 to-fuchsia-700',
  pink: 'from-pink-500 via-rose-500 to-red-500',
  amber: 'from-amber-400 via-orange-500 to-rose-500',
  emerald: 'from-brand-400 via-brand-600 to-emerald-700',
  slate: 'from-slate-500 via-slate-700 to-ink-900',
};

/**
 * Khu vực trường học / ký túc xá.
 *
 * Danh sách thật do quản trị viên cấu hình (Quản trị → Khu vực) và đọc qua
 * `useCampuses()`; `DEFAULT_CAMPUSES` chỉ là bộ seed/fallback.
 */
export { DEFAULT_CAMPUSES, CAMPUS_KINDS, CAMPUS_KIND_MAP } from './campuses';

export const POST_STATUSES = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang bán' },
  { value: 'sold', label: 'Đã bán' },
];

/** Lý do phát sinh đột xuất (không tính vào hạn mức ăn uống/sinh hoạt). */
export const UNEXPECTED_REASONS = [
  { value: 'Sửa xe', label: 'Sửa xe', icon: 'wrench' },
  { value: 'Y tế', label: 'Y tế', icon: 'health' },
  { value: 'Thiết bị học tập', label: 'Thiết bị học tập', icon: 'laptop' },
  { value: 'Khác', label: 'Khác', icon: 'alert' },
];

export const FUND_STATUS = {
  safe: {
    label: 'An toàn',
    hint: 'Còn hơn 30% hạn mức hôm nay',
    text: 'text-brand-700',
    chip: 'bg-brand-50 text-brand-700 ring-brand-100',
    bar: 'from-brand-400 to-brand-600',
    soft: 'from-brand-50 via-white to-emerald-50/70',
    ring: 'ring-brand-100',
    dot: 'bg-brand-500',
  },
  warning: {
    label: 'Cảnh báo',
    hint: 'Còn dưới 30% hạn mức hôm nay',
    text: 'text-amber-700',
    chip: 'bg-amber-50 text-amber-700 ring-amber-100',
    bar: 'from-amber-400 to-orange-500',
    soft: 'from-amber-50 via-white to-orange-50/70',
    ring: 'ring-amber-100',
    dot: 'bg-amber-500',
  },
  over: {
    label: 'Vượt hạn mức',
    hint: 'Bạn đã chi vượt quỹ hôm nay',
    text: 'text-rose-700',
    chip: 'bg-rose-50 text-rose-700 ring-rose-100',
    bar: 'from-rose-400 to-rose-600',
    soft: 'from-rose-50 via-white to-rose-50/70',
    ring: 'ring-rose-100',
    dot: 'bg-rose-500',
  },
  empty: {
    label: 'Chưa có quỹ',
    hint: 'Thêm ngân sách tháng để bắt đầu',
    text: 'text-ink-600',
    chip: 'bg-ink-100 text-ink-600 ring-ink-200',
    bar: 'from-ink-300 to-ink-400',
    soft: 'from-ink-50 via-white to-ink-50',
    ring: 'ring-ink-200',
    dot: 'bg-ink-400',
  },
};

export const TIPS = [
  'Ghi chi tiêu ngay khi vừa thanh toán để không bị quên.',
  'Đặt hạn mức mỗi ngày thấp hơn 10% thu nhập để nuôi heo đất.',
  'Tận dụng kèo gom đơn để tiết kiệm tới 40% chi phí ăn uống.',
  'Chỉ mua đồ pass khi thật sự cần, đừng vì rẻ mà mua.',
  'Mỗi cuối tuần, xem lại 7 ngày qua để điều chỉnh tuần tới.',
];
