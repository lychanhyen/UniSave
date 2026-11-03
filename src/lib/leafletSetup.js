/**
 * Cấu hình Leaflet dùng chung.
 *
 * Leaflet mặc định trỏ icon marker tới ảnh trong node_modules nên bundler
 * không tìm ra. Ta thay bằng DivIcon vẽ bằng CSS (xem .map-pin trong index.css)
 * để không phụ thuộc đường dẫn ảnh.
 */
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const PIN_TONE = {
  brand: '#00834a',
  amber: '#b45309',
  rose: '#be123c',
};

export function pinIcon(tone = 'brand') {
  const color = PIN_TONE[tone] || PIN_TONE.brand;
  return L.divIcon({
    className: 'map-pin-wrapper',
    html: `<span class="map-pin" style="--pin-color:${color}"><span class="map-pin__dot"></span></span>`,
    iconSize: [28, 34],
    iconAnchor: [14, 32],
    popupAnchor: [0, -28],
  });
}

export default L;
