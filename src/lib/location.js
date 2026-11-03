/**
 * Toạ độ tin đăng.
 *
 * Vị trí được làm tròn 4 chữ số thập phân (~11m ở Việt Nam) trước khi lưu:
 * đủ chính xác để người mua tìm tới (sai số dưới 20m) nhưng không lộ chính xác
 * phòng ký túc xá của sinh viên.
 */
export const COORD_PRECISION = 4;

/** Tâm mặc định khi chưa có tin nào: trung tâm TP.HCM. */
export const DEFAULT_MAP_CENTER = { lat: 10.7769, lng: 106.7009 };
export const DEFAULT_MAP_ZOOM = 13;
export const PICKER_MAP_ZOOM = 16;

export function roundCoord(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  const factor = 10 ** COORD_PRECISION;
  return Math.round(number * factor) / factor;
}

export function roundCoords({ lat, lng } = {}) {
  const nextLat = roundCoord(lat);
  const nextLng = roundCoord(lng);
  if (nextLat === null || nextLng === null) return null;
  if (Math.abs(nextLat) > 90 || Math.abs(nextLng) > 180) return null;
  return { lat: nextLat, lng: nextLng };
}

export function hasPostCoords(post) {
  const lat = Number(post?.lat);
  const lng = Number(post?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

/** Toạ độ hiển thị trên bản đồ: ưu tiên toạ độ tin, thiếu thì dùng tâm mặc định. */
export function mapCenterFor(posts = []) {
  const first = posts.find((post) => hasPostCoords(post));
  if (!first) return DEFAULT_MAP_CENTER;
  return { lat: Number(first.lat), lng: Number(first.lng) };
}
