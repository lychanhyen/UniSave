import { MapContainer, Circle, Marker } from 'react-leaflet';
import { Navigation } from 'lucide-react';
import MapTiles from './MapTiles';
import { pinIcon } from '../../lib/leafletSetup';
import { BLUR_RADIUS_METERS, DETAIL_MAP_ZOOM, directionsUrl, hasPostCoords } from '../../lib/location';

/**
 * Bản đồ vị trí của một tin đăng, dành cho người mua.
 *
 * Vòng tròn nét đứt thể hiện bán kính đã làm mờ: vị trí thật nằm đâu đó trong
 * vòng tròn này, đủ để hẹn gặp ở khu vực nhận hàng.
 */
export default function PostLocationMap({ post, height = 260 }) {
  if (!hasPostCoords(post)) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-200 bg-ink-50 px-4 py-10 text-center">
        <p className="text-[13px] font-bold text-ink-700">Người bán chưa ghim vị trí</p>
        <p className="mt-1 max-w-xs text-[15px] leading-relaxed text-ink-500">
          Hãy nhắn tin hoặc gọi điện để biết chỗ nhận hàng chính xác.
        </p>
        {post?.contact ? (
          <a href={`tel:${post.contact}`} className="btn-secondary mt-4 py-2 text-xs">
            Gọi {post.contact}
          </a>
        ) : null}
      </div>
    );
  }

  const lat = Number(post.lat);
  const lng = Number(post.lng);

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border-2 border-brand-200">
        <MapContainer
          center={[lat, lng]}
          zoom={DETAIL_MAP_ZOOM}
          scrollWheelZoom={false}
          style={{ height, width: '100%' }}
        >
          <MapTiles />
          <Circle
            center={[lat, lng]}
            radius={BLUR_RADIUS_METERS}
            pathOptions={{
              color: '#00834a',
              weight: 1.5,
              dashArray: '5 5',
              fillColor: '#00834a',
              fillOpacity: 0.08,
            }}
          />
          <Marker position={[lat, lng]} icon={pinIcon('brand')} />
        </MapContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={directionsUrl(post)}
          target="_blank"
          rel="noreferrer"
          className="btn-primary py-2 text-xs"
        >
          <Navigation className="h-3.5 w-3.5" />
          Chỉ đường tới đây
        </a>
        <span className="text-[11px] font-semibold tabular-nums text-ink-500">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </span>
      </div>

      <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
        Vị trí đã làm mờ trong bán kính {BLUR_RADIUS_METERS}m (vòng tròn nét đứt) để bảo vệ chỗ ở
        của sinh viên. Hẹn gặp ở khu vực này rồi nhắn tin để biết điểm hẹn cụ thể.
      </p>
    </div>
  );
}
