import { AlertTriangle, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

/**
 * Cảnh báo vượt hạn mức — khối viền rose trên nền giấy, không nền đậm.
 */
export default function OverspendAlert({ overspendToday = 0, overspendTotal = 0 }) {
  if (overspendToday <= 0 && overspendTotal <= 0) return null;

  const isToday = overspendToday > 0;
  const amount = isToday ? overspendToday : overspendTotal;

  return (
    <section className="rounded-3xl border border-rose-200 bg-white px-5 py-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-rose-700">
          {isToday ? <AlertTriangle className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        </span>
        <div className="min-w-0">
          <p className="text-[12px] font-bold text-rose-800">
            {isToday ? 'Hôm nay đã vượt hạn mức' : 'Có ngày chi vượt hạn mức'}
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-rose-700/80">
            {isToday
              ? `Vượt ${formatCurrency(amount)}. Phần vượt trừ vào quỹ những ngày còn lại.`
              : `Tổng ${formatCurrency(amount)} đã trừ vào quỹ các ngày sau. Heo đất vẫn được giữ theo ngân sách tháng.`}
          </p>
        </div>
      </div>
    </section>
  );
}