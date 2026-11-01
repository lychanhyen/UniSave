/**
 * Khu vực (KTX, trường đại học, quận/huyện…) – dữ liệu nền cho toàn ứng dụng.
 *
 * Danh sách thật được quản trị viên cấu hình trong trang Quản trị → Khu vực và
 * lưu ở bảng `campuses` (Supabase) hoặc localStorage (chế độ demo). File này chỉ
 * giữ bộ giá trị mặc định để seed lần đầu và làm fallback khi chưa tải được.
 */

/** Nhóm khu vực – dùng cho bộ lọc và form quản trị. */
export const CAMPUS_KINDS = [
  { value: 'ktx', label: 'Ký túc xá', hint: 'KTX trong hoặc gần trường' },
  { value: 'university', label: 'Trường đại học', hint: 'Cơ sở của một trường' },
  { value: 'area', label: 'Khu vực / quận', hint: 'Quận, huyện, phường' },
  { value: 'other', label: 'Khác', hint: 'Địa điểm không thuộc nhóm trên' },
];

export const CAMPUS_KIND_MAP = Object.fromEntries(CAMPUS_KINDS.map((k) => [k.value, k]));

/** Giá trị dự phòng: mọi hồ sơ/tin đăng cũ đều rơi về đây khi khu vực bị xoá. */
export const FALLBACK_CAMPUS = 'khac';

/**
 * Không cho xoá khu vực mặc định vì cột `campus`/`location` trong database dùng
 * 'khac' làm giá trị default và hàng loạt bản ghi cũ đang trỏ tới.
 */
export function isProtectedCampus(value) {
  return value === FALLBACK_CAMPUS;
}

/** Bộ khu vực mặc định, dùng để seed lần đầu. */
export const DEFAULT_CAMPUSES = [
  { value: 'ktx-a', label: 'KTX Khu A', area: 'Làng đại học', kind: 'ktx', sort_order: 10 },
  { value: 'ktx-b', label: 'KTX Khu B', area: 'Làng đại học', kind: 'ktx', sort_order: 20 },
  { value: 'bach-khoa', label: 'ĐH Bách Khoa', area: 'Hai Bà Trưng', kind: 'university', sort_order: 30 },
  {
    value: 'kinh-te',
    label: 'ĐH Kinh tế Quốc dân',
    area: 'Hai Bà Trưng',
    kind: 'university',
    sort_order: 40,
  },
  { value: 'quoc-gia', label: 'ĐH Quốc gia', area: 'Thủ Đức', kind: 'university', sort_order: 50 },
  { value: 'fpt', label: 'ĐH FPT', area: 'Hòa Lạc', kind: 'university', sort_order: 60 },
  {
    value: 'khac',
    label: 'Khu vực khác',
    area: 'Toàn thành phố',
    kind: 'other',
    sort_order: 999,
  },
].map((item) => ({ ...item, is_active: true }));

/** Bỏ dấu tiếng Việt và tạo slug ổn định cho một khu vực. */
export function campusSlug(label) {
  const base = String(label || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return base || 'khu-vuc';
}

/** Tạo slug không trùng với danh sách hiện có (ktx-khu-a, ktx-khu-a-2, …). */
export function uniqueCampusSlug(label, existing = []) {
  const taken = new Set(existing.map((item) => item.value));
  const base = campusSlug(label);
  if (!taken.has(base)) return base;
  let index = 2;
  while (taken.has(`${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}

/** Chuẩn hoá bản ghi từ Supabase/localStorage về cùng một hình dạng. */
export function normalizeCampus(row) {
  return {
    value: String(row.value || row.id || '').trim(),
    label: String(row.label || row.name || '').trim(),
    area: String(row.area || '').trim(),
    kind: CAMPUS_KIND_MAP[row.kind] ? row.kind : 'other',
    sort_order: Number.isFinite(Number(row.sort_order)) ? Number(row.sort_order) : 0,
    is_active: row.is_active !== false,
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  };
}

export function sortCampuses(list) {
  return [...list].sort(
    (a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label, 'vi')
  );
}

export function buildCampusMap(list = []) {
  return Object.fromEntries(list.map((item) => [item.value, item]));
}

/** Nhãn hiển thị cho một giá trị khu vực, kể cả khi khu vực đã bị xoá. */
export function campusLabelOf(map, value) {
  const found = map?.[value];
  if (found) return found.label;
  return map?.[FALLBACK_CAMPUS]?.label || 'Khu vực khác';
}

/** Mô tả ngắn "KTX Khu A · Làng đại học" dùng trong select/chi tiết. */
export function campusDisplay(item) {
  if (!item) return '';
  return item.area ? `${item.label} · ${item.area}` : item.label;
}
