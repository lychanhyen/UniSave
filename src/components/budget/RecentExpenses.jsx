import { Receipt } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export default function RecentExpenses({ expenses = [] }) {
  return (
    <div className="card-strong p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">Chi tiêu gần đây</h2>
        <span className="chip bg-ink-100 text-ink-500">{expenses.length} khoản</span>
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-400">
            <Receipt className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm font-semibold text-ink-700">Chưa có chi tiêu nào</p>
          <p className="mt-1 text-xs text-ink-400">Thêm khoản chi đầu tiên để bắt đầu theo dõi.</p>
        </div>
      ) : (
        <ul className="divide-y divide-brand-200/50">
          {expenses.map((e) => (
            <li key={e.id} className="flex items-center gap-3 py-3.5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <Receipt className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-900">{e.note}</p>
                <p className="text-xs text-ink-400">{e.category}</p>
              </div>
              <span className="text-sm font-bold text-ink-900">-{formatCurrency(e.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}