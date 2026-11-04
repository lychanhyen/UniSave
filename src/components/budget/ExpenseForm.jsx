import { useState } from 'react';
import { AlertTriangle, Plus, Receipt, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import MoneyInput from '../ui/MoneyInput';
import { CATEGORIES, UNEXPECTED_REASONS } from '../../lib/constants';
import { cn } from '../../lib/utils';

export default function ExpenseForm({ onAdd }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]?.value || 'food');
  const [unexpected, setUnexpected] = useState(false);
  const [reason, setReason] = useState(UNEXPECTED_REASONS[0].value);

  function handleSubmit(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    onAdd?.({
      amount: Number(amount),
      note: note || (unexpected ? reason : 'Chi tiêu'),
      category,
      is_unexpected: unexpected,
      unexpected_reason: unexpected ? reason : '',
    });
    toast.success(
      unexpected ? 'Đã ghi khoản đột xuất, hạn mức ngày được giữ ổn định' : 'Đã thêm chi tiêu'
    );
    setAmount('');
    setNote('');
    setUnexpected(false);
  }

  function toggleUnexpected() {
    setUnexpected((value) => {
      const next = !value;
      if (next) setCategory('other');
      return next;
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card-strong px-5 py-5 sm:px-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-ink-400" />
          <h2 className="section-title">Ghi chi tiêu</h2>
        </div>
        <button
          type="button"
          onClick={toggleUnexpected}
          aria-pressed={unexpected}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors',
            unexpected
              ? 'border-amber-300 bg-amber-50 text-amber-800'
              : 'border-brand-200/70 text-ink-500 hover:border-amber-300 hover:text-amber-700'
          )}
        >
          <AlertTriangle className="h-3 w-3" />
          Đột xuất
        </button>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-[1fr_1.5fr_auto]">
        <MoneyInput value={amount} onChange={setAmount} placeholder="Số tiền" />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={unexpected ? `Ví dụ: ${reason.toLowerCase()}` : 'Ví dụ: Ăn trưa'}
          className="input"
        />
        <Button type="submit" icon={Plus}>
          Thêm
        </Button>
      </div>

      {unexpected ? (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-amber-800">
            Khoản phát sinh đột xuất
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-amber-800/80">
            Khoản này được trải đều vào hạn mức cả tháng, không dồn hết vào hôm nay.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {UNEXPECTED_REASONS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setReason(item.value)}
                className={cn(
                  'rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors',
                  reason === item.value
                    ? 'border-amber-400 bg-white text-amber-900'
                    : 'border-amber-200 bg-transparent text-amber-700 hover:bg-white'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-400">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
          Bật “Đột xuất” cho sửa xe, y tế, thiết bị học tập để không làm tụt hạn mức ngày.
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={cn(
              'rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors',
              category === c.value
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-brand-200/70 text-ink-600 hover:border-ink-300 hover:bg-ink-50'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
    </form>
  );
}