import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export default function FloatingActionButton({ to = '/dashboard', label = 'Thêm mới', className }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={cn(
        'fixed bottom-24 right-5 z-40 grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow transition-transform hover:scale-105 active:scale-95 lg:bottom-8 lg:right-8',
        className
      )}
    >
      <Plus className="h-6 w-6" strokeWidth={2.4} />
    </Link>
  );
}
