import { UserRound, BadgeCheck } from 'lucide-react';
import { cn, initials } from '../../lib/utils';

export default function Avatar({ src, name = '', size = 'md', verified = false, className }) {
  const sizes = {
    sm: 'h-9 w-9 text-xs',
    md: 'h-11 w-11 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl',
  };

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          'grid place-items-center overflow-hidden rounded-lg bg-brand-100 font-bold text-brand-700',
          sizes[size]
        )}
      >
        {src ? (
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : name ? (
          <span>{initials(name)}</span>
        ) : (
          <UserRound className="h-1/2 w-1/2" />
        )}
      </div>
      {verified && (
        <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-white">
          <BadgeCheck className="h-4 w-4 text-brand-600" />
        </span>
      )}
    </div>
  );
}