import { BadgeCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function VerifiedBadge({ className, label = 'Đã xác thực' }) {
  return (
    <span
      className={cn(
        'chip bg-brand-50 text-brand-700 ring-1 ring-brand-100',
        className
      )}
    >
      <BadgeCheck className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
