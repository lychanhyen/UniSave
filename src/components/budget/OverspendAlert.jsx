import { AlertTriangle, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export default function OverspendAlert({ overspendToday = 0, overspendTotal = 0 }) {
  if (overspendToday <= 0 && overspendTotal <= 0) return null;

  const isToday = overspendToday > 0;
  const amount = isToday ? overspendToday : overspendTotal;

  return (
    <div className="flex items-start gap-3 rounded-3xl border border-rose-200 bg-rose-50 p-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-600">
        {isToday ? <AlertTriangle className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
      </span>
      <div>
        <p className="text-sm font-bold text-rose-700">
          {isToday ? 'Hôm nay bạn đã vượt hạn mức!' : 'Đã có ngày chi vượt hạn mức'}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-rose-600">
          {isToday
            ? `Vượt ${formatCurrency(amount)} so với hạn mức hôm nay. Phần vượt sẽ được trừ vào quỹ những ngày còn lại.`
            : `Tổng ${formatCurrency(amount)} chi vượt hạn mức đã được trừ vào quỹ các ngày sau. Heo đất vẫn được bảo toàn theo đúng ngân sách tháng.`}
        </p>
      </div>
    </div>
  );
}
