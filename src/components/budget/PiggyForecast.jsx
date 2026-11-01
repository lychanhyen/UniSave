import { formatCurrency } from '../../lib/utils';

/**
 * Dự báo heo đất cuối tháng — con số dự báo là chính, thanh mảnh so sánh
 * hiện tại / dự báo. Không khối trang trí.
 */
export default function PiggyForecast({ state }) {
  const target = Math.max(1, state.savingsTarget);
  const forecastPercent = Math.min(100, Math.round((state.forecastPiggy / target) * 100));
  const currentPercent = Math.min(100, Math.round((state.piggyBank / target) * 100));

  return (
    <section className="card-strong px-5 py-4">
      <p className="eyebrow">Dự báo cuối tháng</p>

      <p className="figure-lg mt-2 text-brand-700">{formatCurrency(state.forecastPiggy)}</p>

      <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
        {state.daysLeft > 0
          ? `Nếu chi khoảng ${formatCurrency(state.projectedDailySpend)}/ngày trong ${state.daysLeft} ngày còn lại.`
          : state.todayRemaining > 0
            ? `Chốt sổ tối nay: ${formatCurrency(state.todayRemaining)} hạn mức còn lại vào heo đất.`
            : 'Hạn mức hôm nay đã dùng hết, chưa có thêm phần dư.'}
      </p>

      <div className="relative mt-3.5 h-1 overflow-hidden rounded-full bg-ink-200">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-ink-300"
          style={{ width: `${currentPercent}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-brand-600"
          style={{ width: `${forecastPercent}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-400">
        <span>Hiện tại {currentPercent}%</span>
        <span>Dự báo {forecastPercent}%</span>
      </div>

      <div className="mt-4 space-y-2 border-t border-brand-200/60 pt-3">
        <div className="flex items-baseline justify-between gap-2 text-[11px]">
          <span className="text-ink-500">Thưởng thêm dự kiến</span>
          <span className="figure-md text-[12px] text-brand-700">
            +{formatCurrency(state.forecastReward)}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-2 text-[11px]">
          <span className="text-ink-500">Tối thiểu nếu giữ đúng hạn mức</span>
          <span className="figure-md text-[12px] text-ink-900">
            {formatCurrency(state.forecastIfOnBudget)}
          </span>
        </div>
      </div>
    </section>
  );
}