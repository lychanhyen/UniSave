import { useState } from 'react';
import { Check, Coins, Loader2, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { INCOME_SOURCES, INCOME_SOURCE_MAP } from '../../lib/constants';
import MoneyInput from '../ui/MoneyInput';
import { cn, formatCurrency, formatDate } from '../../lib/utils';

/**
 * Thu nhập thêm: đi làm thêm, gia đình gửi, học bổng…
 * Mỗi khoản được cộng thẳng vào ngân sách tháng và xoá được để trừ ra.
 */
export default function IncomeCard({ incomes = [], monthKey, onAdd, onRemove }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState(INCOME_SOURCES[0]?.value || 'other');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const thisMonth = incomes.filter((item) => String(item.date || '').startsWith(monthKey || ''));
  const total = thisMonth.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  async function handleSubmit(event) {
    event.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error('Nhập số tiền hợp lệ');
      return;
    }
    setSaving(true);
    try {
      await onAdd?.({ amount: value, source, note: note.trim() });
      toast.success('Đã cộng vào ngân sách tháng');
      setAmount('');
      setNote('');
      setOpen(false);
    } catch (error) {
      toast.error(error.message || 'Không thêm được thu nhập.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card-strong px-5 py-5 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <Coins className="h-4 w-4 text-brand-600" />
            Thu nhập thêm
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
            Đi làm thêm, được gửi thêm tiền? Cộng thẳng vào ngân sách tháng, không phải sửa lại tổng.
          </p>
        </div>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn-secondary py-2 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm khoản
          </button>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3 rounded-xl bg-brand-50/70 px-3 py-2.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-700/80">
          Đã cộng tháng này
        </span>
        <span className="figure-md text-brand-800">{formatCurrency(total)}</span>
      </div>

      {thisMonth.length > 0 && (
        <ul className="mt-2">
          {thisMonth.slice(0, 4).map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 border-t border-brand-200/60 py-2 first:border-t-0"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <Coins className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-ink-900">
                  {INCOME_SOURCE_MAP[item.source]?.label || 'Khoản khác'}
                </p>
                <p className="truncate text-[11px] text-ink-400">
                  {item.note ? `${item.note} · ` : ''}
                  {formatDate(item.date)}
                </p>
              </div>
              <span className="shrink-0 text-[12px] font-bold tabular-nums text-brand-700">
                +{formatCurrency(item.amount)}
              </span>
              <button
                type="button"
                onClick={() => onRemove?.(item.id)}
                className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-ink-300 transition hover:bg-rose-50 hover:text-rose-600"
                aria-label="Xoá khoản thu nhập"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <form onSubmit={handleSubmit} className="mt-3 rounded-xl bg-ink-50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
              Khoản thu nhập mới
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-6 w-6 place-items-center rounded-md text-ink-400 hover:bg-white hover:text-ink-700"
              aria-label="Đóng"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div>
              <label className="label mb-1 text-[10px]" htmlFor="income-amount">
                Số tiền (VND)
              </label>
              <MoneyInput
                id="income-amount"
                value={amount}
                onChange={setAmount}
                placeholder="1.500.000"
                className="py-2 text-[12px]"
                autoFocus
              />
            </div>
            <div>
              <label className="label mb-1 text-[10px]" htmlFor="income-source">
                Nguồn
              </label>
              <select
                id="income-source"
                value={source}
                onChange={(event) => setSource(event.target.value)}
                className="input py-2 text-[12px]"
              >
                {INCOME_SOURCES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-2">
            <label className="label mb-1 text-[10px]" htmlFor="income-note">
              Ghi chú
            </label>
            <input
              id="income-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ca làm tối thứ 6"
              className="input py-2 text-[12px]"
              maxLength={80}
            />
          </div>

          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-secondary flex-1 justify-center py-2 text-[11px]"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              className={cn('btn-primary flex-1 justify-center py-2 text-[11px] disabled:opacity-60')}
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              {saving ? 'Đang cộng…' : 'Cộng vào ngân sách'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
