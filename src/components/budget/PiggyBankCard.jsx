import { PiggyBank } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export default function PiggyBankCard({ piggyBank = 0, target = 0 }) {
  const percent = target > 0 ? Math.min(100, Math.round((piggyBank / target) * 100)) : 0;

  return (
    <div className="card overflow-hidden p-0">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6">
        <div className="flex items-center gap-2 text-amber-700">
          <PiggyBank className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wide">Heo đất của bạn</span>
        </div>
        <p className="mt-3 text-3xl font-extrabold tracking-tight text-amber-600">
          {formatCurrency(piggyBank)}
        </p>
        <p className="mt-1 text-xs text-amber-700/70">10% ngân sách + tiền dư mỗi ngày</p>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between text-xs font-medium text-ink-500">
          <span>Mục tiêu tháng</span>
          <span>{percent}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}