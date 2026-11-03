import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup } from 'react-leaflet';
import MapTiles from './MapTiles';
import { ArrowRight, MapPin } from 'lucide-react';
import { pinIcon } from '../../lib/leafletSetup';
import { DEFAULT_MAP_ZOOM, hasPostCoords, mapCenterFor } from '../../lib/location';
import { formatCurrency, formatRelativeTime } from '../../lib/utils';
import { POST_CATEGORY_MAP } from '../../lib/constants';

/**
 * Bản đồ chợ: mỗi tin có toạ độ là một marker, bấm vào hiện thẻ tóm tắt
 * kèm liên kết sang trang chi tiết.
 */
export default function PostMap({ posts = [], currentUserId }) {
  const pinned = useMemo(() => posts.filter((post) => hasPostCoords(post)), [posts]);
  const center = useMemo(() => mapCenterFor(pinned), [pinned]);

  if (pinned.length === 0) {
    return (
      <div className="card-strong flex flex-col items-center px-5 py-14 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <MapPin className="h-6 w-6" />
        </span>
        <p className="mt-3 text-sm font-bold text-ink-900">Chưa có tin nào ghim vị trí</p>
        <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-ink-500">
          Khi đăng tin, người bán chọn vị trí trên bản đồ thì tin sẽ hiện ở đây. Bạn vẫn xem được
          toàn bộ tin ở chế độ danh sách.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border-2 border-brand-200 bg-white">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={DEFAULT_MAP_ZOOM}
        scrollWheelZoom
        style={{ height: 560, width: '100%' }}
      >
        <MapTiles />

        {pinned.map((post) => {
          const isOwner = post.owner_id === currentUserId;
          const meta = POST_CATEGORY_MAP[post.category] || POST_CATEGORY_MAP.other;
          return (
            <Marker
              key={post.id}
              position={[Number(post.lat), Number(post.lng)]}
              icon={pinIcon(isOwner ? 'brand' : post.status === 'sold' ? 'rose' : 'amber')}
            >
              <Popup minWidth={220}>
                <div className="w-[220px]">
                  <p className="text-[13px] font-bold leading-snug text-ink-900">{post.title}</p>
                  <p className="mt-1 text-[15px] font-extrabold text-brand-700">
                    {formatCurrency(post.price)}
                    {post.type === 'rent' ? (
                      <span className="text-[10px] font-semibold text-ink-400">/tháng</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-500">
                    {meta.label} · {formatRelativeTime(post.created_at)}
                  </p>
                  <Link
                    to={`/marketplace/${post.id}`}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-brand-700"
                  >
                    Xem tin
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
