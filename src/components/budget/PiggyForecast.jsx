import { Info, PiggyBank, Sparkles, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export default function PiggyForecast({ state }) {
  const target = Math.max(1, state.savingsTarget);
  const percent = Math.min(100, Math.round((state.forecastPiggy / target) * 100));
  const currentPercent = Math.min(100, Math.round((state.piggyBank / target) * 100));

  return (
    <div className="card overflow-hidden p-0">
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-5 text-white">
        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-amber-200/20 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-amber-50">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
              Dự báo heo đất cuối tháng
            </span>
          </div>
          <p className="mt-2.5 text-3xl font-extrabold tracking-tight">
            {formatCurrency(state.forecastPiggy)}
          </p>
          <p className="mt-1 text-xs text-amber-50/90">
            {state.daysLeft > 0
              ? `Nếu mỗi ngày chi khoảng ${formatCurrency(state.projectedDailySpend)} trong ${state.daysLeft} ngày còn lại.`
              : state.todayRemaining > 0
                ? `Chốt sổ tối nay: ${formatCurrency(state.todayRemaining)} hạn mức còn lại tự chuyển vào heo đất.`
                : 'Hạn mức hôm nay đã dùng hết, chưa có thêm phần dư cho heo đất.'}
          </p>

          <div className="mt-3.5">
            <div className="relative h-2 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-white/40 transition-all duration-700"
                style={{ width: `${currentPercent}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-white transition-all duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] font-semibold text-amber-50/90">
              <span>Hiện tại {currentPercent}%</span>
              <span>Dự báo {percent}% mục tiêu 25%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 p-4">
        <div className="flex items-center justify-between rounded-xl bg-ink-50 px-3 py-2 text-[11px] font-medium text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <PiggyBank className="h-3.5 w-3.5 text-amber-500" />
            Heo đất hiện tại
          </span>
          <span className="font-bold text-ink-800">{formatCurrency(state.piggyBank)}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-brand-100 bg-brand-50/60 px-3 py-2 text-[11px] font-medium text-brand-700">
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Thưởng thêm dự kiến
          </span>
          <span className="font-bold">+{formatCurrency(state.forecastReward)}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-ink-50 px-3 py-2 text-[11px] font-medium text-ink-500">
          <span>Tối thiểu nếu giữ đúng hạn mức</span>
          <span className="font-bold text-ink-800">{formatCurrency(state.forecastIfOnBudget)}</span>
        </div>
        <p className="flex items-start gap-1.5 px-1 pt-1 text-[10px] leading-relaxed text-ink-400">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          Dự báo dựa trên mức chi trung bình {formatCurrency(state.avgDailySpend)}/ngày. Chi ít hơn
          hạn mức, phần dư tự chảy vào heo đất.
        </p>
      </div>
    </div>
  );
}
