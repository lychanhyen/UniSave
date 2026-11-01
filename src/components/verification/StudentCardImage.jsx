import { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { resolveStudentCardUrl } from '../../lib/api';
import { cn } from '../../lib/utils';

/**
 * Hiển thị ảnh thẻ sinh viên. Chế độ demo lưu data URL, Supabase lưu đường dẫn
 * trong bucket riêng tư nên cần đổi thành signed URL trước khi hiển thị.
 */
export default function StudentCardImage({ value, alt = 'Ảnh thẻ sinh viên', className, onClick }) {
  const [url, setUrl] = useState(() =>
    value && (value.startsWith('data:') || value.startsWith('http')) ? value : ''
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setFailed(false);
    if (!value) {
      setUrl('');
      return undefined;
    }
    if (value.startsWith('data:') || value.startsWith('http')) {
      setUrl(value);
      return undefined;
    }
    setUrl('');
    resolveStudentCardUrl(value)
      .then((next) => {
        if (active) setUrl(next || '');
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [value]);

  if (!url || failed) {
    return (
      <div
        className={cn(
          'grid place-items-center rounded-2xl border border-dashed border-ink-200 bg-ink-50 text-ink-300',
          className
        )}
      >
        <CreditCard className="h-6 w-6" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={cn('bg-white object-cover', onClick && 'cursor-zoom-in', className)}
      onClick={onClick}
      onError={() => setFailed(true)}
      loading="lazy"
      decoding="async"
    />
  );
}
