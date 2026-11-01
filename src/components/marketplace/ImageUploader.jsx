import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Move, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const DEFAULT_POSITION = '50% 50%';

const PRESETS = [
  { label: 'Trên', value: '50% 15%' },
  { label: 'Giữa', value: '50% 50%' },
  { label: 'Dưới', value: '50% 85%' },
  { label: 'Trái', value: '15% 50%' },
  { label: 'Phải', value: '85% 50%' },
];

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressImage(file, maxSize = 1100, quality = 0.72) {
  const dataUrl = await readFile(file);
  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });

  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}

/** Hộp căn chỉnh: chọn điểm làm tâm ảnh để khung 4:3 không cắt mất sản phẩm. */
function FocusDialog({ src, position, onChange, onClose }) {
  const boxRef = useRef(null);

  function handlePick(event) {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));
    onChange(`${Math.round(x)}% ${Math.round(y)}%`);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-pop relative w-full max-w-lg rounded-3xl bg-white p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-ink-900">Căn chỉnh ảnh bìa</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-ink-500">
              Nhấn vào điểm có sản phẩm. Khung 4:3 ở chợ sẽ lấy điểm đó làm tâm ảnh.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={boxRef}
          onClick={handlePick}
          className="relative mt-4 aspect-[4/3] w-full cursor-crosshair overflow-hidden rounded-2xl border border-brand-200 bg-ink-100"
        >
          <img
            src={src}
            alt="Ảnh bìa"
            className="h-full w-full object-cover"
            style={{ objectPosition: position }}
            draggable={false}
          />
          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="h-10 w-10 rounded-full border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.12)]" />
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange(preset.value)}
              className={cn(
                'chip border text-[11px] transition',
                position === preset.value
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-brand-200 bg-white text-ink-600 hover:border-brand-300'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onChange(DEFAULT_POSITION)}
            className="btn-secondary flex-1 justify-center py-2.5 text-xs"
          >
            Về giữa
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary flex-1 justify-center py-2.5 text-xs"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ImageUploader({
  value = [],
  onChange,
  max = 4,
  coverPosition = DEFAULT_POSITION,
  onCoverPositionChange,
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);

  async function handleFiles(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    const room = max - value.length;
    if (room <= 0) {
      toast.error(`Chỉ được tải tối đa ${max} ảnh`);
      return;
    }

    setBusy(true);
    try {
      const results = [];
      for (const file of files.slice(0, room)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} không phải ảnh`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} vượt quá 8MB`);
          continue;
        }
        results.push(await compressImage(file));
      }
      if (results.length) onChange([...value, ...results]);
    } catch {
      toast.error('Không thể xử lý ảnh, thử lại nhé');
    } finally {
      setBusy(false);
    }
  }

  function removeAt(index) {
    const next = value.filter((_, i) => i !== index);
    onChange(next);
    if (index === 0 && onCoverPositionChange) onCoverPositionChange(DEFAULT_POSITION);
  }

  const position = coverPosition || DEFAULT_POSITION;

  return (
    <div>
      {value.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={cn(
            'flex h-44 w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-ink-300 bg-ink-50/60 text-ink-500 transition',
            'hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-600 disabled:opacity-60'
          )}
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-soft">
            {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
          </span>
          <span className="text-sm font-semibold">
            {busy ? 'Đang xử lý ảnh…' : 'Nhấn để tải ảnh lên'}
          </span>
          <span className="text-xs text-ink-400">JPG, PNG · tối đa 4 ảnh · mỗi ảnh dưới 8MB</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((src, index) => (
            <div
              key={`${index}-${src.slice(-12)}`}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-brand-200/70 bg-ink-50"
            >
              <img
                src={src}
                alt={`Ảnh ${index + 1}`}
                className="h-full w-full object-cover"
                style={index === 0 ? { objectPosition: position } : undefined}
              />
              {index === 0 && (
                <>
                  <span className="absolute left-2 top-2 rounded-full bg-ink-900/75 px-2 py-0.5 text-[10px] font-bold text-white">
                    Ảnh bìa
                  </span>
                  <button
                    type="button"
                    onClick={() => setFocusOpen(true)}
                    className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-ink-800 shadow-soft transition hover:bg-white"
                    title="Căn chỉnh ảnh bìa"
                  >
                    <Move className="h-3 w-3" />
                    Căn chỉnh
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-ink-900/70 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                aria-label="Xóa ảnh"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {value.length < max && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className={cn(
                'flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-300 bg-ink-50/60 text-ink-500 transition',
                'hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-600 disabled:opacity-60'
              )}
            >
              {busy ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <ImagePlus className="h-6 w-6" />
              )}
              <span className="px-2 text-center text-[11px] font-semibold leading-tight">
                {busy ? 'Đang xử lý…' : 'Thêm ảnh'}
              </span>
            </button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleFiles}
      />
      {value.length > 0 && (
        <p className="mt-2 text-xs text-ink-400">
          Tối đa {max} ảnh, mỗi ảnh dưới 8MB. Ảnh đầu tiên là ảnh bìa — bấm “Căn chỉnh” để chọn
          đúng chỗ có sản phẩm.
        </p>
      )}

      {focusOpen && value[0] && (
        <FocusDialog
          src={value[0]}
          position={position}
          onChange={(next) => onCoverPositionChange?.(next)}
          onClose={() => setFocusOpen(false)}
        />
      )}
    </div>
  );
}
