import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Hiển thị sao (chỉ đọc) hoặc chọn sao (khi truyền onChange).
 * Kích thước: sm 14px, md 18px, lg 24px.
 */
export default function StarRating({ value = 0, onChange, size = 'md', className, label }) {
  const sizes = { sm: 'h-3.5 w-3.5', md: 'h-4.5 w-4.5', lg: 'h-6 w-6' };
  const interactive = typeof onChange === 'function';

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)} aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        const icon = (
          <Star
            className={cn(
              sizes[size],
              active ? 'fill-amber-400 text-amber-400' : 'text-ink-300',
              interactive && 'transition-transform group-hover/star:scale-110'
            )}
          />
        );

        if (!interactive) return <span key={star}>{icon}</span>;

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="group/star rounded p-0.5"
            aria-label={`${star} sao`}
            aria-pressed={active}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
