import { useRef, useState } from 'react';
import { ImagePlus, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { compressImageFile } from '../../lib/image';
import { cn } from '../../lib/utils';
import StudentCardImage from './StudentCardImage';

/**
 * Ô tải ảnh thẻ sinh viên. Trả data URL (đã nén) qua onChange; việc lưu
 * localStorage/Storage do trang gọi component quyết định.
 */
export default function StudentCardUpload({
  value = '',
  onChange,
  disabled = false,
  compact = false,
  className,
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setBusy(true);
    try {
      const dataUrl = await compressImageFile(file);
      onChange?.(dataUrl);
      toast.success('Đã chọn ảnh thẻ sinh viên.');
    } catch (error) {
      toast.error(error.message || 'Không xử lý được ảnh.');
    } finally {
      setBusy(false);
    }
  }

  function openPicker() {
    if (disabled || busy) return;
    inputRef.current?.click();
  }

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="label mb-0">Ảnh thẻ sinh viên</label>
        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange?.('')}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700"
          >
            <Trash2 className="h-3 w-3" />
            Xóa ảnh
          </button>
        )}
      </div>

      {value ? (
        <div className="relative overflow-hidden rounded-2xl border border-ink-200">
          <StudentCardImage
            value={value}
            className={cn('w-full', compact ? 'h-28' : 'h-44')}
            onClick={disabled ? undefined : openPicker}
          />
          {!disabled && (
            <button
              type="button"
              onClick={openPicker}
              disabled={busy}
              className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-xl bg-ink-900/80 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur transition hover:bg-ink-900"
            >
              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              Đổi ảnh
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled || busy}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-4 text-center transition',
            compact ? 'py-5' : 'py-7',
            disabled
              ? 'cursor-not-allowed border-ink-200 bg-ink-50 text-ink-300'
              : 'border-brand-200 bg-brand-50/50 text-brand-700 hover:border-brand-300 hover:bg-brand-50'
          )}
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
          <span className="text-xs font-bold">
            {busy ? 'Đang xử lý ảnh…' : 'Tải ảnh thẻ sinh viên'}
          </span>
          <span className="text-[10px] font-medium text-ink-400">
            JPG/PNG · tối đa 8MB · tự động nén
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
        disabled={disabled}
      />

      <p className="mt-1.5 text-[11px] leading-relaxed text-ink-400">
        Chụp rõ họ tên, MSSV và tên trường. Bạn có thể che số CCCD hoặc thông tin không cần thiết.
      </p>
    </div>
  );
}
