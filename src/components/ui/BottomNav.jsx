import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, ShoppingBag, UserRound } from 'lucide-react';
import { cn } from '../../lib/utils';

const ITEMS = [
  { to: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/marketplace', label: 'Chợ', icon: Store },
  { to: '/deals', label: 'Gom đơn', icon: ShoppingBag },
  { to: '/profile', label: 'Hồ sơ', icon: UserRound },
];

export default function BottomNav() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-ink-200/70 bg-white/90 px-2 pb-2 pt-1.5 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-semibold transition-colors',
                isActive ? 'text-brand-600' : 'text-ink-400'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'grid h-9 w-9 place-items-center rounded-xl transition-all',
                    isActive ? 'bg-brand-50 text-brand-600' : 'text-ink-400'
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
