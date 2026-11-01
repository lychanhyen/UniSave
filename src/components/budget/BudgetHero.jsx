import { TrendingUp, Wallet } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

/**
 * Budget hero — panel tối (grad-panel) như OD prototype: một panel lớn, số liệu lớn,
 * thanh tiến độ mảnh, không dùng bóng đen thuần.
 */
export default function BudgetHero({ budget = 0, limit = 0, spent = 0, percent = 0 }) {
  const remaining = budget - spent;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-brand-600 p-6 text-white">
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-emerald-300/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-brand-200/90">Ngân sách tháng</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight tabular-nums">
              {formatCurrency(budget)}
            </p>
          </div>
          <span className="chip bg-white/15 text-white backdrop-blur">
            <TrendingUp className="h-3.5 w-3.5" /> {percent}%
          </span>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-medium text-brand-200/90">
            <span>Đã chi {formatCurrency(spent)}</span>
            <span>Hạn mức/ngày {formatCurrency(limit)}</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs font-medium text-brand-200/90">
          <Wallet className="h-4 w-4" />
          còn lại {formatCurrency(remaining)}
        </div>
      </div>
    </div>
  );
}