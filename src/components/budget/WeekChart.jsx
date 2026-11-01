import { formatCurrency } from '../../lib/utils';

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

/**
 * 7 ngày qua — cột sắc, hôm nay là cột duy nhất đậm màu.
 */
export default function WeekChart({ days = [] }) {
  const max = Math.max(1, ...days.map((d) => d.expense), 0);
  const total = days.reduce((s, d) => s + d.expense, 0);

  return (
    <section className="card-strong px-5 py-5 sm:px-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="section-title">7 ngày qua</h2>
        <span className="figure-md text-[13px] text-ink-500">{formatCurrency(total)}</span>
      </div>

      <div className="mt-5 flex items-end gap-1.5 sm:gap-2.5">
        {days.map((d, i) => {
          const isToday = i === days.length - 1;
          const height = Math.max(6, Math.round((d.expense / max) * 100));
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[9px] font-bold tabular-nums text-ink-400">
                {d.expense > 0 ? formatCurrency(d.expense).replace(/\s?₫/, '') : '—'}
              </span>
              <div className="flex h-24 w-full items-end">
                <div
                  className={
                    'w-full rounded-sm transition-[height] duration-700 ' +
                    (isToday ? 'bg-brand-600' : d.expense > 0 ? 'bg-ink-300' : 'bg-ink-200')
                  }
                  style={{ height: `${height}%` }}
                />
              </div>
              <span
                className={
                  'text-[10px] font-bold ' + (isToday ? 'text-brand-700' : 'text-ink-400')
                }
              >
                {DAYS[i] || ''}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}