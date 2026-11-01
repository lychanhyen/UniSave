import { AlertTriangle, CheckCircle2, ShieldAlert, Wallet } from 'lucide-react';
import { FUND_STATUS } from '../../lib/constants';
import { cn, formatCurrency } from '../../lib/utils';

const ICONS = {
  safe: CheckCircle2,
  warning: ShieldAlert,
  over: AlertTriangle,
  empty: Wallet,
};

const BAR = {
  safe: 'bg-brand-600',
  warning: 'bg-amber-500',
  over: 'bg-rose-600',
  empty: 'bg-ink-400',
};

/**
 * Quỹ hôm nay — con số là nhân vật chính, trạng thái là chữ nhỏ chứ không phải chip.
 */
export default function DailyFundStatus({ state }) {
  const status = FUND_STATUS[state.fundStatus] || FUND_STATUS.safe;
  const Icon = ICONS[state.fundStatus] || CheckCircle2;
  const percentUsed = Math.max(1.5, Math.min(100, Math.round(state.todayPercentUsed)));

  return (
    <section className="card-strong overflow-hidden">
      <div className="px-5 pb-4 pt-5">
        <div className="flex items-center justify-between gap-2">
          <p className="eyebrow">Quỹ hôm nay</p>
          <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-bold', status.text)}>
            <Icon className="h-3.5 w-3.5" />
            {status.label}
          </span>
        </div>

        <p className={cn('figure-lg mt-2.5', status.text)}>
          {formatCurrency(state.todayRemaining)}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-ink-500">{status.hint}</p>

        <div className="mt-3.5 h-1 overflow-hidden rounded-full bg-ink-200">
          <div
            className={cn('h-full rounded-full transition-[width] duration-700', BAR[state.fundStatus] || BAR.safe)}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-ink-400">
          <span>Đã chi {formatCurrency(state.todaySpent)}</span>
          <span>Hạn mức {formatCurrency(state.todayLimit)}</span>
        </div>
      </div>

      <div className="border-t border-brand-200/60 bg-ink-50/60 px-5 py-3.5">
        {state.todayUnexpected > 0 ? (
          <div className="mb-2 flex items-baseline justify-between gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" />
              Đột xuất hôm nay
            </span>
            <span className="figure-md text-[12px] text-amber-700">
              {formatCurrency(state.todayUnexpected)}
            </span>
          </div>
        ) : null}

        <div className="flex items-baseline justify-between gap-2 text-[11px]">
          <span className="text-ink-500">
            {state.daysLeft > 0 ? 'Hạn mức gợi ý ngày mai' : 'Tháng đã kết thúc'}
          </span>
          <span className="figure-md text-[12px] text-ink-900">
            {state.daysLeft > 0 ? formatCurrency(state.dailyLimit) : '—'}
          </span>
        </div>

        <div className="mt-2.5 flex items-center gap-3 text-[10px] font-semibold text-ink-400">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" /> an toàn
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> sắp hết
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" /> vượt mức
          </span>
        </div>
      </div>
    </section>
  );
}