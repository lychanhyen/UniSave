import { AlertTriangle, CheckCircle2, ShieldAlert, Wallet } from 'lucide-react';
import { FUND_STATUS } from '../../lib/constants';
import { cn, formatCurrency } from '../../lib/utils';

const ICONS = {
  safe: CheckCircle2,
  warning: ShieldAlert,
  over: AlertTriangle,
  empty: Wallet,
};

export default function DailyFundStatus({ state }) {
  const status = FUND_STATUS[state.fundStatus] || FUND_STATUS.safe;
  const Icon = ICONS[state.fundStatus] || CheckCircle2;
  const percentUsed = Math.max(2, Math.round(state.todayPercentUsed));

  return (
    <div className={cn('card overflow-hidden p-0 ring-1', status.ring)}>
      <div className={cn('bg-gradient-to-br p-5', status.soft)}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'grid h-9 w-9 place-items-center rounded-xl bg-white shadow-soft',
                status.text
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">
                Quỹ chi tiêu hôm nay
              </p>
              <p className="text-sm font-bold text-ink-900">
                Ngày {state.today}/{state.D}
              </p>
            </div>
          </div>
          <span className={cn('chip shrink-0 ring-1', status.chip)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
            {status.label}
          </span>
        </div>

        <p className={cn('mt-4 text-3xl font-extrabold tracking-tight', status.text)}>
          {formatCurrency(state.todayRemaining)}
        </p>
        <p className="mt-1 text-xs text-ink-500">{status.hint}</p>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80 ring-1 ring-ink-200/60">
          <div
            className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', status.bar)}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-ink-500">
          <span>Chi sinh hoạt {formatCurrency(state.todaySpent)}</span>
          <span>Hạn mức {formatCurrency(state.todayLimit)}</span>
        </div>
      </div>

      <div className="space-y-1.5 p-4">
        {state.todayUnexpected > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2 text-[11px] font-medium text-amber-700">
            <span className="inline-flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Phát sinh đột xuất hôm nay
            </span>
            <span className="font-bold">{formatCurrency(state.todayUnexpected)}</span>
          </div>
        )}
        <div className="flex items-center justify-between rounded-xl bg-ink-50 px-3 py-2 text-[11px] font-medium text-ink-500">
          <span>{state.daysLeft > 0 ? 'Gợi ý hạn mức ngày mai' : 'Tháng đã kết thúc'}</span>
          <span className="font-bold text-ink-800">
            {state.daysLeft > 0 ? formatCurrency(state.dailyLimit) : '—'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-ink-50 px-3 py-2 text-[10px] font-semibold text-ink-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Xanh &gt;30%
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Vàng &lt;30%
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Đỏ vượt mức
          </span>
        </div>
      </div>
    </div>
  );
}
