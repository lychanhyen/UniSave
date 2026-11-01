import { Inbox } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-ink-100 text-ink-400">
        <Icon className="h-8 w-8" />
      </span>
      <h3 className="mt-4 text-base font-bold text-ink-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
