import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Bell,
  CheckCheck,
  Flag,
  Lock,
  LockOpen,
  MessageCircle,
  PartyPopper,
  ShieldCheck,
  ShieldX,
  Sparkles,
  UserPlus,
  X,
} from 'lucide-react';
import { cn, formatRelativeTime } from '../../lib/utils';
import { useNotifications } from '../../hooks/useNotifications';

const TYPE_STYLE = {
  deal_join: { icon: UserPlus, tone: 'bg-blue-50 text-blue-600' },
  deal_full: { icon: PartyPopper, tone: 'bg-amber-50 text-amber-600' },
  post_inquiry: { icon: MessageCircle, tone: 'bg-brand-50 text-brand-600' },
  system: { icon: Sparkles, tone: 'bg-violet-50 text-violet-600' },
  admin_verification: { icon: ShieldCheck, tone: 'bg-amber-50 text-amber-600' },
  admin_report: { icon: Flag, tone: 'bg-rose-50 text-rose-600' },
  verification_approved: { icon: BadgeCheck, tone: 'bg-brand-50 text-brand-600' },
  verification_rejected: { icon: ShieldX, tone: 'bg-rose-50 text-rose-600' },
  account_locked: { icon: Lock, tone: 'bg-rose-50 text-rose-600' },
  account_unlocked: { icon: LockOpen, tone: 'bg-brand-50 text-brand-600' },
  report_resolved: { icon: Flag, tone: 'bg-blue-50 text-blue-600' },
};

export default function NotificationBell({ surface = 'all' }) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications({ surface });
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleOpen(item) {
    markRead(item.id);
    setOpen(false);
    if (item.link) navigate(item.link);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
        aria-label={`Thông báo${unreadCount ? ` (${unreadCount} chưa đọc)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-ink-900/20 backdrop-blur-[2px]" />
            <div
              className={cn(
                'animate-pop absolute w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-3xl border border-ink-200/80 bg-white shadow-card',
                surface === 'desktop'
                  ? 'right-3 top-16 sm:right-6 sm:top-20 lg:left-[17rem] lg:right-auto lg:top-6'
                  : 'right-3 top-16 sm:right-6 sm:top-20'
              )}
              onClick={(event) => event.stopPropagation()}
            >
            <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Bell className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink-900">Thông báo</p>
                  <p className="text-[11px] text-ink-400">
                    {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Bạn đã xem hết'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="inline-flex items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-bold text-brand-600 transition hover:bg-brand-50"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Đọc tất cả
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-xl text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
                  aria-label="Đóng thông báo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[26rem] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-12 text-center">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-400">
                    <Bell className="h-6 w-6" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-ink-700">Chưa có thông báo</p>
                  <p className="mt-1 text-xs text-ink-400">
                    Khi có duyệt hồ sơ, tố cáo hoặc hoạt động mới, bạn sẽ thấy ngay tại đây.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-ink-100">
                  {notifications.map((item) => {
                    const style = TYPE_STYLE[item.type] || TYPE_STYLE.system;
                    const Icon = style.icon;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => handleOpen(item)}
                          className={cn(
                            'flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-ink-50',
                            !item.read && 'bg-brand-50/40'
                          )}
                        >
                          <span
                            className={cn(
                              'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                              style.tone
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold leading-snug text-ink-900">
                                {item.title}
                              </span>
                              {!item.read && (
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                              )}
                            </span>
                            {item.body && (
                              <span className="mt-1 line-clamp-2 block text-[11px] leading-relaxed text-ink-500">
                                {item.body}
                              </span>
                            )}
                            <span className="mt-1 block text-[10px] font-medium text-ink-400">
                              {formatRelativeTime(item.created_at)}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-ink-100 bg-ink-50/60 px-4 py-2.5 text-center text-[10px] font-medium text-ink-400">
              Cập nhật realtime khi có duyệt hồ sơ, tố cáo hoặc hoạt động mới
            </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
