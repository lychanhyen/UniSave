import { useState } from 'react';
import { Wallet } from 'lucide-react';
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
    <form onSubmit={handleSubmit} className="card-strong px-5 py-5 sm:px-6">
      <div className="mb-5 flex items-center gap-2">
        <Wallet className="h-4 w-4 text-brand-600" />
        <h2 className="section-title">Thiết lập ngân sách</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Ngân sách tháng (VND)"
          type="number"
          icon={Wallet}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="5.000.000"
          min={100000}
          step={1}
        />
        <Input
          label="Tháng"
          type="number"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          min={1}
          max={12}
        />
      </div>

      <div className="mt-4 flex flex-col-reverse items-stretch gap-3 border-t border-brand-200/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] leading-relaxed text-ink-400">
          Hạn mức/ngày = 90% ngân sách chia số ngày trong tháng.
        </p>
        <Button type="submit" className="shrink-0">
          Lưu ngân sách
        </Button>
      </div>
    </form>
  );
}