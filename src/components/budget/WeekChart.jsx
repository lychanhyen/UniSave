import { useMemo } from 'react';
import { AlertTriangle, ArrowUpRight, CalendarDays } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function WeekChart({ expenses = [] }) {
  const days = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate()
      ).padStart(2, '0')}`;
      const dayExpenses = expenses.filter((e) => e.date === key);
      const regular = dayExpenses
        .filter((e) => !e.is_unexpected)
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const unexpected = dayExpenses
        .filter((e) => e.is_unexpected)
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      result.push({
        key,
        label: DAY_LABELS[date.getDay()],
        regular,
        unexpected,
        total: regular + unexpected,
        isToday: i === 0,
      });
    }
    return result;
  }, [expenses]);

  const max = Math.max(...days.map((d) => d.total), 1);
  const weekTotal = days.reduce((sum, d) => sum + d.total, 0);
  const weekUnexpected = days.reduce((sum, d) => sum + d.unexpected, 0);
  const avg = Math.round(weekTotal / 7);
  const today = days[days.length - 1];
  const yesterday = days[days.length - 2];
  const trend =
    yesterday?.total > 0 ? Math.round(((today.total - yesterday.total) / yesterday.total) * 100) : 0;

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="section-title">7 ngày qua</h2>
        <span
          className={cn(
            'chip',
            trend > 0 ? 'bg-rose-50 text-rose-600' : 'bg-brand-50 text-brand-700'
          )}
        >
          <ArrowUpRight className={cn('h-3.5 w-3.5', trend <= 0 && 'rotate-90')} />
          {trend > 0 ? `+${trend}%` : `${Math.abs(trend)}%`}
        </span>
      </div>
      <p className="text-xs text-ink-400">
        Tổng tuần {formatCurrency(weekTotal)} · TB {formatCurrency(avg)}/ngày
      </p>

      {weekUnexpected > 0 && (
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-100">
          <AlertTriangle className="h-3 w-3" />
          Trong đó {formatCurrency(weekUnexpected)} phát sinh đột xuất
        </div>
      )}

      <div className="mt-5 flex h-36 gap-2">
        {days.map((day) => {
          const height = day.total > 0 ? Math.max(6, Math.round((day.total / max) * 96)) : 4;
          const regularShare = day.total > 0 ? (day.regular / day.total) * 100 : 0;
          const unexpectedShare = day.total > 0 ? (day.unexpected / day.total) * 100 : 0;
          return (
            <div key={day.key} className="group flex flex-1 flex-col items-center gap-2">
              <div className="relative flex w-full flex-1 items-end">
                <div
                  className={cn(
                    'relative w-full overflow-hidden rounded-t-lg transition-all duration-500',
                    day.total > 0 ? 'bg-ink-100' : 'bg-ink-100'
                  )}
                  style={{ height: `${height}px` }}
                >
                  {day.total > 0 && (
                    <>
                      <div
                        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-600 to-brand-400"
                        style={{ height: `${regularShare}%` }}
                      />
                      <div
                        className="absolute inset-x-0 top-0 bg-gradient-to-t from-amber-400 to-rose-400"
                        style={{ height: `${unexpectedShare}%` }}
                      />
                    </>
                  )}
                </div>
                <span className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                  {formatCurrency(day.total)}
                  {day.unexpected > 0 ? ` · đột xuất ${formatCurrency(day.unexpected)}` : ''}
                </span>
              </div>
              <span
                className={cn(
                  'text-[10px] font-semibold',
                  day.isToday ? 'text-brand-600' : 'text-ink-400'
                )}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2 text-[11px] font-medium text-ink-500">
        <CalendarDays className="h-3.5 w-3.5 text-ink-400" />
        Hôm nay bạn đã chi {formatCurrency(today.total)}
        {today.unexpected > 0 ? ` (đột xuất ${formatCurrency(today.unexpected)})` : ''}
      </div>
    </div>
  );
}
