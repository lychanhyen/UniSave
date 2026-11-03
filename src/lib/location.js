/**
 * Toạ độ tin đăng.
 *
 * Vị trí người bán chọn được LÀM MỜ trước khi lưu: điểm công khai nằm cách vị trí
 * thật 15–50m theo một hướng cố định (băm từ toạ độ gốc nên lần sau vẫn ra đúng
 * điểm đó). Nhờ vậy người mua tìm tới được khu vực nhận hàng nhưng không biết
 * chính xác phòng ký túc xá của sinh viên.
 */
export const BLUR_RADIUS_METERS = 50;
const BLUR_MIN_METERS = 15;

/** Tâm mặc định khi chưa có tin nào: trung tâm TP.HCM. */
export const DEFAULT_MAP_CENTER = { lat: 10.7769, lng: 106.7009 };
export const DEFAULT_MAP_ZOOM = 13;
export const DETAIL_MAP_ZOOM = 16;
export const PICKER_MAP_ZOOM = 16;

const METERS_PER_DEGREE_LAT = 111_320;

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Dịch điểm thật tới một điểm công khai cách 15–50m, ổn định cho cùng toạ độ.
 * Gọi hàm này một lần lúc lưu tin, không gọi lại khi hiển thị.
 */
export function blurCoords({ lat, lng } = {}) {
  const rawLat = Number(lat);
  const rawLng = Number(lng);
  if (!Number.isFinite(rawLat) || !Number.isFinite(rawLng)) return null;
  if (Math.abs(rawLat) > 90 || Math.abs(rawLng) > 180) return null;

  const hash = hashString(`${rawLat.toFixed(6)},${rawLng.toFixed(6)}`);
  const distance = BLUR_MIN_METERS + (hash % 3500) / 100; // 15.00 … 49.99 m
  const angle = (((hash >>> 9) % 360) * Math.PI) / 180;

  const deltaLat = (distance * Math.cos(angle)) / METERS_PER_DEGREE_LAT;
  const cosLat = Math.cos((rawLat * Math.PI) / 180) || 1;
  const deltaLng = (distance * Math.sin(angle)) / (METERS_PER_DEGREE_LAT * cosLat);

  return {
    lat: Number((rawLat + deltaLat).toFixed(6)),
    lng: Number((rawLng + deltaLng).toFixed(6)),
  };
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

/** Liên kết mở Google Maps để xem đường đi tới điểm đã làm mờ. */
export function directionsUrl(post) {
  if (!hasPostCoords(post)) return '';
  const lat = Number(post.lat);
  const lng = Number(post.lng);
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
