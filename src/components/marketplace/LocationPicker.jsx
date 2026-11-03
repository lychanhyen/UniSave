import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { Check, Crosshair, Loader2, MapPin, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { pinIcon, TILE_ATTRIBUTION, TILE_URL } from '../../lib/leafletSetup';
import {
  DEFAULT_MAP_CENTER,
  PICKER_MAP_ZOOM,
  hasPostCoords,
  roundCoords,
} from '../../lib/location';
import { cn } from '../../lib/utils';

/** Bắt sự kiện bấm lên bản đồ để đặt marker. */
function ClickToPick({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

/** Bay tới toạ độ mới khi người dùng lấy vị trí hiện tại. */
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], PICKER_MAP_ZOOM, { duration: 0.6 });
  }, [map, target]);
  return null;
}

/**
 * Ô chọn vị trí cho tin đăng: bản đồ nhỏ, marker kéo được, bấm để đặt,
 * và nút "Dùng vị trí hiện tại". Toạ độ được làm tròn trước khi trả ra ngoài.
 */
export default function LocationPicker({ value, onChange, className }) {
  const [locating, setLocating] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const markerRef = useRef(null);
  const hasPoint = hasPostCoords(value);
  const center = hasPoint ? [Number(value.lat), Number(value.lng)] : [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng];

  function commit(lat, lng) {
    const next = roundCoords({ lat, lng });
    if (!next) {
      toast.error('Toạ độ không hợp lệ.');
      return;
    }
    onChange?.(next);
  }

  function handleLocate() {
    if (!navigator.geolocation) {
      toast.error('Thiết bị không hỗ trợ định vị.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = roundCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocating(false);
        if (!next) {
          toast.error('Không đọc được toạ độ.');
          return;
        }
        onChange?.(next);
        setFlyTarget(next);
        toast.success(
          `Đã lấy vị trí hiện tại (sai số ${Math.round(position.coords.accuracy || 0)}m).`
        );
      },
      (error) => {
        setLocating(false);
        toast.error(
          error.code === error.PERMISSION_DENIED
            ? 'Bạn chưa cho phép truy cập vị trí. Hãy bật quyền vị trí cho trình duyệt.'
            : 'Không lấy được vị trí hiện tại, bạn hãy bấm trực tiếp trên bản đồ.'
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }

  return (
    <div className={cn('rounded-2xl border-2 border-brand-200 bg-white p-3', className)}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
            <MapPin className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[13px] font-bold text-ink-900">Ghim vị trí trên bản đồ</p>
            <p className="text-[11px] text-ink-500">
              Bấm lên bản đồ hoặc kéo điểm ghim. Toạ độ lưu được làm tròn ~11m.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLocate}
            disabled={locating}
            className="btn-secondary py-2 text-[11px] disabled:opacity-60"
          >
            {locating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Crosshair className="h-3.5 w-3.5" />
            )}
            {locating ? 'Đang định vị…' : 'Dùng vị trí hiện tại'}
          </button>
          {hasPoint && (
            <button
              type="button"
              onClick={() => onChange?.(null)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-ink-500 transition hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Bỏ ghim
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-brand-200">
        <MapContainer
          center={center}
          zoom={hasPoint ? PICKER_MAP_ZOOM : 12}
          scrollWheelZoom={false}
          style={{ height: 240, width: '100%' }}
        >
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <ClickToPick onPick={commit} />
          <FlyTo target={flyTarget} />
          {hasPoint && (
            <Marker
              position={[Number(value.lat), Number(value.lng)]}
              icon={pinIcon('brand')}
              draggable
              ref={markerRef}
              eventHandlers={{
                dragend() {
                  const point = markerRef.current?.getLatLng();
                  if (point) commit(point.lat, point.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
        {hasPoint ? (
          <>
            <span className="inline-flex items-center gap-1 font-semibold text-brand-700">
              <Check className="h-3.5 w-3.5" />
              Đã ghim: {Number(value.lat).toFixed(4)}, {Number(value.lng).toFixed(4)}
            </span>
            <span className="text-ink-500">Người mua sẽ thấy tin này trên bản đồ chợ.</span>
          </>
        ) : (
          <span className="text-ink-500">
            Chưa ghim vị trí — tin vẫn đăng được nhưng không hiện trên bản đồ chợ.
          </span>
        )}
      </div>
    </div>
  );
}
