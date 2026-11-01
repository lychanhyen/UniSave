import { useState } from 'react';
import { Wallet, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export default function BudgetForm({
  onComplete,
  initialAmount = 5000000,
  initialMonth = new Date().getMonth() + 1,
}) {
  const [amount, setAmount] = useState(initialAmount);
  const [month, setMonth] = useState(initialMonth);

  function handleSubmit(e) {
    e.preventDefault();
    if (!amount || amount < 100000) {
      toast.error('Ngân sách tối thiểu 100.000đ');
      return;
    }
    toast.success('Đã cập nhật ngân sách tháng');
    onComplete?.({ amount: Number(amount), month: Number(month) });
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Wallet className="h-5 w-5" />
        </span>
        <h2 className="section-title">Thiết lập ngân sách</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Ngân sách tháng (VND)"
          type="number"
          icon={Wallet}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="5.000.000"
          min={100000}
          step={100000}
        />
        <Input
          label="Tháng"
          type="number"
          icon={CalendarDays}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          min={1}
          max={12}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-xs text-ink-400">
          Hạn mức/ngày = 90% ngân sách chia số ngày trong tháng.
        </p>
        <Button type="submit">Lưu ngân sách</Button>
      </div>
    </form>
  );
}