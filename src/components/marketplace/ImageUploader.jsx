import { useRef, useState } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

const MAX_FILE_SIZE = 8 * 1024 * 1024;

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

export default function ImageUploader({ value = [], onChange, max = 4 }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

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
    onChange(value.filter((_, i) => i !== index));
  }

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
            <img src={src} alt={`Ảnh ${index + 1}`} className="h-full w-full object-cover" />
            {index === 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-ink-900/75 px-2 py-0.5 text-[10px] font-bold text-white">
                Ảnh bìa
              </span>
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
          Tối đa {max} ảnh, mỗi ảnh dưới 8MB. Ảnh đầu tiên sẽ là ảnh bìa.
        </p>
      )}
    </div>
  );
}
