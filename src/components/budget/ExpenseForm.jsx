import { useState } from 'react';
import { AlertTriangle, Plus, Receipt, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
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
    <form onSubmit={handleSubmit} className="card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Receipt className="h-5 w-5" />
          </span>
          <div>
            <h2 className="section-title">Thêm chi tiêu</h2>
            <p className="text-[11px] text-ink-400">Ghi lại mỗi ngày để hạn mức luôn chính xác.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleUnexpected}
          className={cn(
            'chip shrink-0 border transition',
            unexpected
              ? 'border-amber-300 bg-amber-100 text-amber-800'
              : 'border-ink-200 bg-white text-ink-500 hover:border-amber-200 hover:text-amber-700'
          )}
          aria-pressed={unexpected}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Đột xuất
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Số tiền (VND)"
          className="input"
        />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={unexpected ? `Ghi chú, ví dụ: ${reason.toLowerCase()}` : 'Ghi chú, ví dụ: Ăn trưa'}
          className="input"
        />
        <Button type="submit" icon={Plus}>
          Thêm
        </Button>
      </div>

      {unexpected ? (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wide">
              Khoản phát sinh đột xuất
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-amber-700/80">
            Khoản này được trải đều vào hạn mức cả tháng, không dồn hết vào hạn mức ăn uống hôm
            nay. Chọn lý do để dễ nhìn lại cuối tháng.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {UNEXPECTED_REASONS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setReason(item.value)}
                className={cn(
                  'chip border transition',
                  reason === item.value
                    ? 'border-amber-400 bg-white text-amber-800 shadow-soft'
                    : 'border-amber-200/80 bg-amber-50 text-amber-700 hover:bg-white'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-400">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-500" />
          Mẹo: bật “Đột xuất” cho sửa xe, y tế, thiết bị học tập để không làm tụt hạn mức ngày.
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={`chip transition ${
              category === c.value
                ? 'bg-brand-600 text-white'
                : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </form>
  );
}
