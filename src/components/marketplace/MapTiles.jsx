import { useRef, useState } from 'react';
import { TileLayer } from 'react-leaflet';

/**
 * Lớp tile bản đồ có tự chuyển nhà cung cấp.
 *
 * Mạng ở Việt Nam thường chặn hoặc không phân giải được tile.openstreetmap.org,
 * nên mặc định dùng gương OSM của Đức; nếu tile lỗi liên tiếp thì tự đổi sang
 * CARTO rồi tới OSM gốc. Nhờ vậy bản đồ không bị xám dù mạng chặn domain nào.
 */
const PROVIDERS = [
  {
    id: 'osm-de',
    url: 'https://tile.openstreetmap.de/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
  },
  {
    id: 'carto',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    subdomains: 'abcd',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>',
  },
  {
    id: 'osm',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
  },
];

/** Sau bao nhiêu tile lỗi thì đổi nhà cung cấp kế tiếp. */
const ERROR_THRESHOLD = 6;

export default function MapTiles() {
  const [index, setIndex] = useState(0);
  const failures = useRef(0);
  const provider = PROVIDERS[Math.min(index, PROVIDERS.length - 1)];

  return (
    <TileLayer
      key={provider.id}
      url={provider.url}
      attribution={provider.attribution}
      subdomains={provider.subdomains || 'abc'}
      eventHandlers={{
        tileerror() {
          if (index >= PROVIDERS.length - 1) return;
          failures.current += 1;
          if (failures.current >= ERROR_THRESHOLD) {
            failures.current = 0;
            setIndex((current) => Math.min(current + 1, PROVIDERS.length - 1));
          }
        },
      }}
    />
  );
}
