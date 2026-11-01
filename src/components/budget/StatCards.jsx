import { AlertTriangle, Coins, PiggyBank, Wallet } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export default function StatCards({ fund = 0, spent = 0, piggy = 0, unexpected = 0 }) {
  const items = [
    {
      label: 'Quỹ chi tiêu',
      value: formatCurrency(fund),
      hint: 'Tiền còn dùng được',
      icon: Wallet,
      tone: 'from-brand-500 to-brand-600',
    },
    {
      label: 'Heo đất',
      value: formatCurrency(piggy),
      hint: 'Đã tiết kiệm',
      icon: PiggyBank,
      tone: 'from-amber-500 to-orange-500',
    },
    {
      label: 'Đã chi',
      value: formatCurrency(spent),
      hint: 'Trong tháng',
      icon: Coins,
      tone: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Đột xuất',
      value: formatCurrency(unexpected),
      hint: 'Đã trải đều',
      icon: AlertTriangle,
      tone: 'from-rose-500 to-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
      {items.map(({ label, value, hint, icon: Icon, tone }) => (
        <div key={label} className="card card-hover p-5">
          <span className={`grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br text-white ${tone}`}>
            <Icon className="h-5 w-5" />
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
          <p className="mt-1 text-lg font-extrabold tracking-tight text-ink-900">{value}</p>
          <p className="mt-0.5 text-[10px] font-medium text-ink-400">{hint}</p>
        </div>
      ))}
    </div>
  );
}
