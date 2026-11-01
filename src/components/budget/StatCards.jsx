import { AlertTriangle, Coins, PiggyBank, Wallet } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

/**
 * Stat cards — surface card, không gradient; icon nền accent-soft,
 * số liệu dùng font-display + tabular-nums.
 */
export default function StatCards({ fund = 0, spent = 0, piggy = 0, unexpected = 0 }) {
  const items = [
    {
      label: 'Quỹ chi tiêu',
      value: formatCurrency(fund),
      hint: 'Tiền còn dùng được',
      icon: Wallet,
      tone: 'bg-brand-50 text-brand-600',
    },
    {
      label: 'Heo đất',
      value: formatCurrency(piggy),
      hint: 'Đã tiết kiệm',
      icon: PiggyBank,
      tone: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Đã chi',
      value: formatCurrency(spent),
      hint: 'Trong tháng',
      icon: Coins,
      tone: 'bg-sky-50 text-sky-600',
    },
    {
      label: 'Đột xuất',
      value: formatCurrency(unexpected),
      hint: 'Đã trải đều',
      icon: AlertTriangle,
      tone: 'bg-rose-50 text-rose-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
      {items.map(({ label, value, hint, icon: Icon, tone }) => (
        <div key={label} className="card card-hover p-5">
          <span className={`grid h-10 w-10 place-items-center rounded-2xl ${tone}`}>
            <Icon className="h-5 w-5" />
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
          <p className="mt-1 text-lg font-extrabold tracking-tight text-ink-900 tabular-nums">{value}</p>
          <p className="mt-0.5 text-[10px] font-medium text-ink-400">{hint}</p>
        </div>
      ))}
    </div>
  );
}