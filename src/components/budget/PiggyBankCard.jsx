import { PiggyBank } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

/**
 * Heo đất — khối tint nhẹ, một con số lớn, thanh tiến độ mảnh.
 */
export default function PiggyBankCard({ piggyBank = 0, target = 0 }) {
  const percent = target > 0 ? Math.min(100, Math.round((piggyBank / target) * 100)) : 0;

  return (
    <section className="panel-tint overflow-hidden">
      <div className="px-5 pb-4 pt-5">
        <div className="flex items-center justify-between gap-2">
          <p className="eyebrow">Heo đất</p>
          <PiggyBank className="h-4 w-4 text-brand-600" />
        </div>
        <p className="figure-lg mt-2.5 text-brand-700">{formatCurrency(piggyBank)}</p>
        <p className="mt-1 text-[11px] text-ink-500">10% ngân sách + tiền dư mỗi ngày</p>

        <div className="mt-3.5 h-1 overflow-hidden rounded-full bg-ink-200">
          <div
            className="h-full rounded-full bg-brand-600 transition-[width] duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-ink-400">
          <span>Mục tiêu tháng</span>
          <span className="tabular-nums">{percent}%</span>
        </div>
      </div>
    </section>
  );
}