import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Spinner({ size = 'md', className, label }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-9 w-9' };
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-10', className)}>
      <Loader2 className={cn('animate-spin text-brand-600', sizes[size])} />
      {label && <p className="text-sm text-ink-500">{label}</p>}
    </div>
  );
}
